import { prisma } from '../db/prisma';

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  favoriteProducts?: string[];
  preferences?: any;
  userId: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  favoriteProducts?: string[];
  preferences?: any;
  manualDebtBalance?: number;
}

export async function getCustomers(userId: string, filters?: {
  search?: string;
  hasPurchases?: boolean;
}) {
  const where: any = { userId };

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.hasPurchases !== undefined) {
    if (filters.hasPurchases) {
      where.totalPurchases = { gt: 0 };
    } else {
      where.totalPurchases = 0;
    }
  }

  return prisma.customer.findMany({
    where,
    include: {
      sales: {
        orderBy: { date: 'desc' },
        take: 5,
      },
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 5,
      },
      debts: {
        where: { status: 'pending' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCustomerById(id: string, userId: string) {
  return prisma.customer.findFirst({
    where: { id, userId },
    include: {
      sales: {
        include: { items: true },
        orderBy: { date: 'desc' },
      },
      messages: {
        orderBy: { sentAt: 'desc' },
      },
      debts: {
        orderBy: { dueDate: 'asc' },
      },
      visits: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      },
      socialInteractions: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      },
      interests: true,
    },
  });
}

export async function createCustomer(data: CreateCustomerData) {
  try {
    const result = await prisma.customer.create({
      data,
    });
    return result;
  } catch (prismaError) {
    throw prismaError;
  }
}

export async function updateCustomer(id: string, userId: string, data: UpdateCustomerData) {
  // Verify ownership
  const existing = await prisma.customer.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Customer not found');
  }

  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string, userId: string) {
  // Verify ownership
  const existing = await prisma.customer.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Customer not found');
  }

  return prisma.customer.delete({
    where: { id },
  });
}

export async function getCustomerInterests(customerId: string, userId: string) {
  // Verify ownership
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, userId },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  let interests = await prisma.customerInterest.findUnique({
    where: { customerId },
  });

  if (!interests) {
    // Calculate interests from purchase history
    const sales = await prisma.sale.findMany({
      where: { customerId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Simple interest calculation
    const productTypes = new Map<string, number>();
    const colors = new Map<string, number>();
    const prices: number[] = [];

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = item.product;
        if (product.category) {
          productTypes.set(product.category, (productTypes.get(product.category) || 0) + 1);
        }
        if (product.color) {
          colors.set(product.color, (colors.get(product.color) || 0) + 1);
        }
        prices.push(item.unitPrice);
      });
    });

    const productTypesArray = Array.from(productTypes.entries()).map(([type, score]) => ({ type, score }));
    const colorsArray = Array.from(colors.entries()).map(([color, score]) => ({ color, score }));

    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      average: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    };

    interests = await prisma.customerInterest.create({
      data: {
        customerId,
        productTypes: productTypesArray as any,
        colors: colorsArray as any,
        quality: [],
        priceRange: priceRange as any,
      },
    });
  }

  return interests;
}
