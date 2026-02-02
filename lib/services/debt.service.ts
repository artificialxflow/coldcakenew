import { prisma } from '../db/prisma';

export interface CreateDebtData {
  customerId?: string;
  customerName?: string;
  amount: number;
  dueDate: Date;
  checkNumber?: string;
  bank?: string;
  receiveDate?: Date;
  type?: 'received' | 'paid';
  description?: string;
  accountNumber?: string;
}

export async function getDebts(userId: string, filters?: {
  status?: 'paid' | 'pending';
  customerId?: string;
}) {
  const where: any = {};

  if (filters?.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  // Only return debts for customers owned by this user
  if (filters?.customerId) {
    where.customer = { userId };
  } else {
    where.OR = [
      { customer: { userId } },
      { customerId: null }, // Debts without customer (like paid checks)
    ];
  }

  return prisma.debt.findMany({
    where,
    include: {
      customer: true,
    },
    orderBy: { dueDate: 'asc' },
  });
}

export async function getDebtById(id: string, userId: string) {
  return prisma.debt.findFirst({
    where: {
      id,
      OR: [
        { customer: { userId } },
        { customerId: null },
      ],
    },
    include: {
      customer: true,
    },
  });
}

export async function createDebt(userId: string, data: CreateDebtData) {
  // If customerId is provided, verify ownership
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, userId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }
  }

  return prisma.debt.create({
    data: {
      customerId: data.customerId,
      customerName: data.customerName,
      amount: data.amount,
      dueDate: data.dueDate,
      checkNumber: data.checkNumber,
      bank: data.bank,
      receiveDate: data.receiveDate,
      type: data.type,
      description: data.description,
      accountNumber: data.accountNumber,
      status: 'pending',
    },
  });
}

export async function updateDebt(id: string, userId: string, data: Partial<CreateDebtData>) {
  // Verify ownership
  const existing = await prisma.debt.findFirst({
    where: {
      id,
      OR: [
        { customer: { userId } },
        { customerId: null },
      ],
    },
  });

  if (!existing) {
    throw new Error('Debt not found');
  }

  const updateData: any = { ...data };
  if (data.dueDate) {
    updateData.dueDate = data.dueDate;
  }
  if (data.receiveDate) {
    updateData.receiveDate = data.receiveDate;
  }

  return prisma.debt.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteDebt(id: string, userId: string) {
  // Verify ownership
  const existing = await prisma.debt.findFirst({
    where: {
      id,
      OR: [
        { customer: { userId } },
        { customerId: null },
      ],
    },
  });

  if (!existing) {
    throw new Error('Debt not found');
  }

  return prisma.debt.delete({
    where: { id },
  });
}

export async function getUpcomingDebts(userId: string, days: number = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const debts = await prisma.debt.findMany({
    where: {
      status: 'pending',
      dueDate: {
        gte: now,
        lte: futureDate,
      },
      OR: [
        { customer: { userId } },
        { customerId: null },
      ],
    },
    include: {
      customer: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  return debts.map((debt) => {
    const dueDate = new Date(debt.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...debt,
      daysUntilDue,
    };
  });
}
