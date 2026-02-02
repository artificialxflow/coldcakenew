import { prisma } from '../db/prisma';

export interface CreateSaleData {
  customerId: string;
  customerName?: string;
  amount: number;
  date: Date;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export async function getSales(userId: string, filters?: {
  month?: number;
  year?: number;
  customerId?: string;
}) {
  const where: any = {
    customer: { userId },
  };

  if (filters?.month) {
    where.month = filters.month;
  }

  if (filters?.year) {
    where.year = filters.year;
  }

  if (filters?.customerId) {
    where.customerId = filters.customerId;
  }

  return prisma.sale.findMany({
    where,
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getSaleById(id: string, userId: string) {
  return prisma.sale.findFirst({
    where: {
      id,
      customer: { userId },
    },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
  });
}

export async function createSale(userId: string, data: CreateSaleData) {
  // Verify customer belongs to user
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, userId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  // Create sale with items
  const sale = await prisma.sale.create({
    data: {
      customerId: data.customerId,
      customerName: data.customerName,
      amount: data.amount,
      date: data.date,
      month: data.date.getMonth() + 1,
      year: data.date.getFullYear(),
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  // Update inventory (decrease stock)
  for (const item of data.items) {
    const inventory = await prisma.inventory.findFirst({
      where: { productId: item.productId },
    });

    if (inventory) {
      await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: Math.max(0, inventory.quantity - item.quantity),
        },
      });
    }
  }

  // Update customer stats
  await prisma.customer.update({
    where: { id: data.customerId },
    data: {
      totalPurchases: { increment: 1 },
      lastPurchaseDate: data.date,
    },
  });

  return sale;
}

/**
 * Get best selling products based on total sales amount
 * Used for recommending products to new customers
 */
export async function getBestSellingProducts(userId: string, limit: number = 5) {
  // Get all sales for the user
  const sales = await prisma.sale.findMany({
    where: {
      customer: { userId },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Calculate total sales per product
  const productSalesMap = new Map<string, { product: any; totalSales: number; totalQuantity: number }>();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const productId = item.productId;
      const existing = productSalesMap.get(productId);

      if (existing) {
        existing.totalSales += item.quantity * item.unitPrice;
        existing.totalQuantity += item.quantity;
      } else {
        productSalesMap.set(productId, {
          product: item.product,
          totalSales: item.quantity * item.unitPrice,
          totalQuantity: item.quantity,
        });
      }
    });
  });

  // Convert to array and sort by total sales
  const bestSellers = Array.from(productSalesMap.values())
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit)
    .map((item) => item.product);

  return bestSellers;
}

export async function updateSale(id: string, userId: string, data: Partial<CreateSaleData>) {
  // Verify ownership
  const existing = await prisma.sale.findFirst({
    where: {
      id,
      customer: { userId },
    },
  });

  if (!existing) {
    throw new Error('Sale not found');
  }

  const updateData: any = {};
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.date !== undefined) {
    updateData.date = data.date;
    updateData.month = data.date.getMonth() + 1;
    updateData.year = data.date.getFullYear();
  }

  return prisma.sale.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
    },
  });
}

export async function getMonthlySales(month: number, year: number, userId: string) {
  const sales = await prisma.sale.findMany({
    where: {
      month,
      year,
      customer: { userId },
    },
  });

  return sales.reduce((sum, sale) => sum + sale.amount, 0);
}
