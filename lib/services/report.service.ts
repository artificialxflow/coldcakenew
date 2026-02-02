import { prisma } from '../db/prisma';
import {
  calculateMonthlySales,
  findBestSellingMonth,
  calculateWorkingCapital,
  calculateTotalInventoryValue,
  calculateTotalDebts,
} from '../utils/reportCalculator';

export async function getSummaryReport(userId: string, month?: number, year?: number) {
  const currentDate = new Date();
  const currentMonth = month || currentDate.getMonth() + 1;
  const currentYear = year || currentDate.getFullYear();

  // Get all data
  const [customers, sales, inventory, products, debts, goldPrice] = await Promise.all([
    prisma.customer.findMany({ where: { userId } }),
    prisma.sale.findMany({
      where: { customer: { userId } },
      include: { items: true },
    }),
    prisma.inventory.findMany({
      include: { product: true },
    }),
    prisma.product.findMany(),
    prisma.debt.findMany({
      where: {
        OR: [
          { customer: { userId } },
          { customerId: null },
        ],
      },
    }),
    prisma.goldPrice.findFirst({
      orderBy: { lastUpdate: 'desc' },
    }),
  ]);

  const mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    originalPrice: p.originalPrice,
    finalPrice: p.finalPrice,
    color: p.color ?? undefined,
    category: p.category ?? undefined,
    stock: p.stock ?? undefined,
    description: p.description ?? undefined,
    discountedPrice: p.discountedPrice ?? undefined,
    priceHistory: [],
  }));

  // Calculate metrics
  const monthlySales = calculateMonthlySales(
    sales.map((s) => {
      const saleProducts = s.items
        .map((item) => mappedProducts.find((p) => p.id === item.productId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      return {
        id: s.id,
        customerId: s.customerId,
        customerName: s.customerName ?? undefined,
        amount: s.amount,
        date: s.date.toISOString(),
        month: s.month,
        year: s.year,
        items: s.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        products: saleProducts,
      };
    }),
    currentMonth,
    currentYear
  );

  const bestSellingMonth = findBestSellingMonth(
    sales.map((s) => {
      const saleProducts = s.items
        .map((item) => mappedProducts.find((p) => p.id === item.productId))
        .filter((p): p is NonNullable<typeof p> => p !== undefined);

      return {
        id: s.id,
        customerId: s.customerId,
        customerName: s.customerName ?? undefined,
        amount: s.amount,
        date: s.date.toISOString(),
        month: s.month,
        year: s.year,
        items: s.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        products: saleProducts,
      };
    })
  );

  const workingCapital = calculateWorkingCapital(
    inventory.map((inv) => ({
      ...inv,
      productId: inv.productId,
      productName: inv.productName,
      quantity: inv.quantity,
      purchaseDate: inv.purchaseDate?.toISOString(),
      purchasePrice: inv.purchasePrice || 0,
    })),
    mappedProducts,
    debts.map((d) => ({
      id: d.id,
      customerId: d.customerId ?? undefined,
      customerName: d.customerName ?? undefined,
      amount: d.amount,
      dueDate: d.dueDate.toISOString(),
      status: (d.status || 'pending') as 'paid' | 'pending',
      checkNumber: d.checkNumber ?? undefined,
      bank: d.bank ?? undefined,
      receiveDate: d.receiveDate?.toISOString(),
      paidDate: d.paidDate?.toISOString(),
      type: d.type ? (d.type as 'received' | 'paid') : undefined,
      description: d.description ?? undefined,
      accountNumber: d.accountNumber ?? undefined,
    }))
  );

  const totalInventory = calculateTotalInventoryValue(
    inventory.map((inv) => ({
      ...inv,
      productId: inv.productId,
      productName: inv.productName,
      quantity: inv.quantity,
      purchaseDate: inv.purchaseDate?.toISOString(),
      purchasePrice: inv.purchasePrice || 0,
    })),
    mappedProducts
  );

  const totalDebts = calculateTotalDebts(
    debts.map((d) => ({
      id: d.id,
      customerId: d.customerId ?? undefined,
      customerName: d.customerName ?? undefined,
      amount: d.amount,
      dueDate: d.dueDate.toISOString(),
      status: (d.status || 'pending') as 'paid' | 'pending',
      checkNumber: d.checkNumber ?? undefined,
      bank: d.bank ?? undefined,
      receiveDate: d.receiveDate?.toISOString(),
      paidDate: d.paidDate?.toISOString(),
      type: d.type ? (d.type as 'received' | 'paid') : undefined,
      description: d.description ?? undefined,
      accountNumber: d.accountNumber ?? undefined,
    }))
  );

  // Count messages sent today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const messagesCount = await prisma.message.count({
    where: {
      customer: { userId },
      sentAt: { gte: today },
    },
  });

  return {
    monthlySales,
    highestGoldPrice: goldPrice?.yearlyHighest || 0,
    messagesSentToday: messagesCount,
    workingCapital,
    bestSellingMonth,
    totalInventory,
    totalDebts,
  };
}
