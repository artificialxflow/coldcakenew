import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getSales } from '@/lib/services/sale.service';
import { getDebts } from '@/lib/services/debt.service';
import { getSummaryReport } from '@/lib/services/report.service';
import { prisma } from '@/lib/db/prisma';
import { exportToExcel, exportToPDF, exportSummaryReport } from '@/lib/utils/exportReports';
import { Sale, Debt, Inventory, Product } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') as 'excel' | 'pdf' | null;
    const reportType = searchParams.get('type') as 'summary' | 'sales' | 'debts' | 'inventory' | 'all' | null;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;

    const exportFormat = format || 'excel';
    const type = reportType || 'all';

    // Fetch data based on type
    let sales: Sale[] = [];
    let debts: Debt[] = [];
    let inventory: Inventory[] = [];
    let products: Product[] = [];
    let summary: any = null;

    if (type === 'summary' || type === 'all') {
      summary = await getSummaryReport(user.id, month, year);
    }

    if (type === 'sales' || type === 'all') {
      const salesData = await getSales(user.id, { month, year });
      sales = salesData.map((sale) => ({
        id: sale.id,
        customerId: sale.customerId,
        customerName: sale.customerName || sale.customer?.firstName + ' ' + sale.customer?.lastName || 'نامشخص',
        amount: sale.amount,
        date: sale.date.toISOString(),
        month: sale.month,
        year: sale.year,
        products: sale.items
          .filter((item) => item.product)
          .map((item) => ({
            id: item.product!.id,
            name: item.product!.name,
            originalPrice: item.product!.originalPrice,
            finalPrice: item.product!.finalPrice,
            category: item.product!.category || undefined,
            color: item.product!.color || undefined,
            stock: item.product!.stock || undefined,
            description: item.product!.description || undefined,
            priceHistory: [],
          })),
        items: sale.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }));
    }

    if (type === 'debts' || type === 'all') {
      const debtsData = await getDebts(user.id);
      debts = debtsData.map((debt) => ({
        id: debt.id,
        customerId: debt.customerId || '',
        customerName: debt.customerName || debt.customer?.firstName + ' ' + debt.customer?.lastName || 'نامشخص',
        amount: debt.amount,
        dueDate: debt.dueDate.toISOString(),
        checkNumber: debt.checkNumber || undefined,
        bank: debt.bank || undefined,
        status: debt.status as 'paid' | 'pending',
        receiveDate: debt.receiveDate?.toISOString(),
        paidDate: debt.paidDate?.toISOString(),
        type: debt.type as 'received' | 'paid' | undefined,
        description: debt.description || undefined,
      }));
    }

    if (type === 'inventory' || type === 'all') {
      const inventoryData = await prisma.inventory.findMany({
        include: { product: true },
      });
      inventory = inventoryData.map((inv) => ({
        id: inv.id,
        productId: inv.productId,
        productName: inv.productName,
        quantity: inv.quantity,
        purchasePrice: inv.purchasePrice || 0,
        purchaseDate: inv.purchaseDate?.toISOString(),
      }));

      const productsData = await prisma.product.findMany();
      products = productsData.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category ?? undefined,
        originalPrice: p.originalPrice,
        finalPrice: p.finalPrice,
        color: p.color ?? undefined,
        stock: p.stock ?? undefined,
        description: p.description ?? undefined,
        priceHistory: [],
      }));
    }

    // Generate file based on format
    if (type === 'summary') {
      // For summary, use the dedicated export function
      // Since we can't directly download files in API routes, we'll return the data
      // The frontend will handle the actual file download
      return NextResponse.json({
        type: 'summary',
        format: exportFormat,
        data: summary,
        message: 'برای دانلود فایل، از تابع exportSummaryReport در frontend استفاده کنید.',
      });
    }

    // For other types, prepare the data
    // Note: Since we're in an API route, we can't directly call browser download functions
    // The frontend should handle the actual file generation using the returned data
    return NextResponse.json({
      type,
      format: exportFormat,
      data: {
        sales: sales.length > 0 ? sales : undefined,
        debts: debts.length > 0 ? debts : undefined,
        inventory: inventory.length > 0 ? inventory : undefined,
        products: products.length > 0 ? products : undefined,
        summary: summary || undefined,
      },
      message: 'برای دانلود فایل، از توابع exportToExcel یا exportToPDF در frontend استفاده کنید.',
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'خطا در خروجی گرفتن گزارش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
