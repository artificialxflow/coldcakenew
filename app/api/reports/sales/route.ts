import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getSales } from '@/lib/services/sale.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const customerId = searchParams.get('customerId') || undefined;

    const sales = await getSales(user.id, { month, year, customerId });

    // Format sales for frontend
    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      customerId: sale.customerId,
      customerName: sale.customerName || sale.customer?.firstName + ' ' + sale.customer?.lastName || 'نامشخص',
      amount: sale.amount,
      date: sale.date.toISOString(),
      month: sale.month,
      year: sale.year,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
      createdAt: sale.createdAt.toISOString(),
    }));

    return NextResponse.json({
      sales: formattedSales,
      total: formattedSales.reduce((sum, s) => sum + s.amount, 0),
      count: formattedSales.length,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت گزارش فروش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
