import { prisma } from '../db/prisma';
import {
  calculateAccountBalance,
  getTotalDebit,
  getTotalCredit,
  getUpcomingChecks,
} from '../utils/bankLedgerCalculator';

export interface CreateBankAccountData {
  accountNumber: string;
  bankName: string;
  accountType: 'current' | 'savings' | 'other';
  initialBalance: number;
}

export interface CreateBankTransactionData {
  accountId: string;
  date: Date;
  type: 'received' | 'paid';
  checkNumber?: string;
  paidCheckNumber?: string;
  description?: string;
  debit?: number;
  credit?: number;
  customerId?: string;
  customerName?: string;
  bank?: string;
  dueDate?: Date;
}

export async function getBankAccounts(userId: string) {
  // Bank accounts are shared across all users (business-level)
  return prisma.bankAccount.findMany({
    include: {
      transactions: {
        orderBy: [{ date: 'desc' }, { rowNumber: 'desc' }],
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBankAccountById(id: string) {
  return prisma.bankAccount.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: [{ date: 'asc' }, { rowNumber: 'asc' }],
      },
    },
  });
}

export async function createBankAccount(data: CreateBankAccountData) {
  return prisma.bankAccount.create({
    data: {
      ...data,
      currentBalance: data.initialBalance,
    },
  });
}

export async function updateBankAccount(id: string, data: Partial<CreateBankAccountData>) {
  return prisma.bankAccount.update({
    where: { id },
    data,
  });
}

export async function deleteBankAccount(id: string) {
  return prisma.bankAccount.delete({
    where: { id },
  });
}

export async function getBankTransactions(accountId: string) {
  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error('Bank account not found');
  }

  const transactions = await prisma.bankTransaction.findMany({
    where: { accountId },
    orderBy: [{ date: 'asc' }, { rowNumber: 'asc' }],
  });

  // Recalculate balances
  let runningBalance = account.initialBalance;
  const transactionsWithBalance = transactions.map((transaction) => {
    runningBalance = runningBalance + (transaction.credit || 0) - (transaction.debit || 0);
    return {
      ...transaction,
      balance: runningBalance,
    };
  });

  return transactionsWithBalance;
}

export async function createBankTransaction(accountId: string, data: CreateBankTransactionData) {
  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error('Bank account not found');
  }

  // Get the last transaction to determine row number
  const lastTransaction = await prisma.bankTransaction.findFirst({
    where: { accountId },
    orderBy: [{ date: 'desc' }, { rowNumber: 'desc' }],
  });

  const rowNumber = lastTransaction ? lastTransaction.rowNumber + 1 : 1;

  // Calculate new balance
  const currentTransactions = await prisma.bankTransaction.findMany({
    where: { accountId },
    orderBy: [{ date: 'asc' }, { rowNumber: 'asc' }],
  });

  const currentBalance = calculateAccountBalance(
    currentTransactions.map((t) => ({
      id: t.id,
      rowNumber: t.rowNumber,
      date: t.date.toISOString(),
      accountId: t.accountId,
      accountNumber: t.accountNumber,
      type: t.type as 'received' | 'paid',
      checkNumber: t.checkNumber ?? undefined,
      paidCheckNumber: t.paidCheckNumber ?? undefined,
      description: t.description ?? undefined,
      debit: t.debit ?? undefined,
      credit: t.credit ?? undefined,
      balance: t.balance,
      manualRemaining: t.manualRemaining ?? undefined,
      customerId: t.customerId ?? undefined,
      customerName: t.customerName ?? undefined,
      bank: t.bank ?? undefined,
      dueDate: t.dueDate?.toISOString(),
      status: t.status ? (t.status as 'pending' | 'paid') : undefined,
    })),
    account.initialBalance
  );

  const newBalance = currentBalance + (data.credit || 0) - (data.debit || 0);

  // Create transaction
  const transaction = await prisma.bankTransaction.create({
    data: {
      accountId,
      accountNumber: account.accountNumber,
      rowNumber,
      date: data.date,
      type: data.type,
      checkNumber: data.checkNumber,
      paidCheckNumber: data.paidCheckNumber,
      description: data.description,
      debit: data.debit,
      credit: data.credit,
      balance: newBalance,
      customerId: data.customerId,
      customerName: data.customerName,
      bank: data.bank,
      dueDate: data.dueDate,
      status: 'pending',
    },
  });

  // Update account balance
  await prisma.bankAccount.update({
    where: { id: accountId },
    data: { currentBalance: newBalance },
  });

  return transaction;
}

export async function updateBankTransaction(id: string, data: Partial<CreateBankTransactionData>) {
  const transaction = await prisma.bankTransaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const updated = await prisma.bankTransaction.update({
    where: { id },
    data: {
      ...data,
      date: data.date,
      dueDate: data.dueDate,
    },
  });

  // Recalculate account balance
  const account = await prisma.bankAccount.findUnique({
    where: { id: transaction.accountId },
  });

  if (account) {
    const transactions = await prisma.bankTransaction.findMany({
      where: { accountId: transaction.accountId },
      orderBy: [{ date: 'asc' }, { rowNumber: 'asc' }],
    });

    const newBalance = calculateAccountBalance(
      transactions.map((t) => ({
        id: t.id,
        rowNumber: t.rowNumber,
        date: t.date.toISOString(),
        accountId: t.accountId,
        accountNumber: t.accountNumber,
        type: t.type as 'received' | 'paid',
        checkNumber: t.checkNumber ?? undefined,
        paidCheckNumber: t.paidCheckNumber ?? undefined,
        description: t.description ?? undefined,
        debit: t.debit ?? undefined,
        credit: t.credit ?? undefined,
        balance: t.balance,
        manualRemaining: t.manualRemaining ?? undefined,
        customerId: t.customerId ?? undefined,
        customerName: t.customerName ?? undefined,
        bank: t.bank ?? undefined,
        dueDate: t.dueDate?.toISOString(),
        status: t.status ? (t.status as 'pending' | 'paid') : undefined,
      })),
      account.initialBalance
    );

    await prisma.bankAccount.update({
      where: { id: transaction.accountId },
      data: { currentBalance: newBalance },
    });
  }

  return updated;
}

export async function deleteBankTransaction(id: string) {
  const transaction = await prisma.bankTransaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const accountId = transaction.accountId;

  await prisma.bankTransaction.delete({
    where: { id },
  });

  // Recalculate account balance
  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  });

  if (account) {
    const transactions = await prisma.bankTransaction.findMany({
      where: { accountId },
      orderBy: [{ date: 'asc' }, { rowNumber: 'asc' }],
    });

    const newBalance = calculateAccountBalance(
      transactions.map((t) => ({
        id: t.id,
        rowNumber: t.rowNumber,
        date: t.date.toISOString(),
        accountId: t.accountId,
        accountNumber: t.accountNumber,
        type: t.type as 'received' | 'paid',
        checkNumber: t.checkNumber ?? undefined,
        paidCheckNumber: t.paidCheckNumber ?? undefined,
        description: t.description ?? undefined,
        debit: t.debit ?? undefined,
        credit: t.credit ?? undefined,
        balance: t.balance,
        manualRemaining: t.manualRemaining ?? undefined,
        customerId: t.customerId ?? undefined,
        customerName: t.customerName ?? undefined,
        bank: t.bank ?? undefined,
        dueDate: t.dueDate?.toISOString(),
        status: t.status ? (t.status as 'pending' | 'paid') : undefined,
      })),
      account.initialBalance
    );

    await prisma.bankAccount.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });
  }
}
