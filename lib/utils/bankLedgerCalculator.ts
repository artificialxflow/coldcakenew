import { BankTransaction, BankAccount } from '@/types';

/**
 * محاسبه مانده حساب بر اساس تراکنش‌ها
 */
export function calculateAccountBalance(
  transactions: BankTransaction[],
  initialBalance: number
): number {
  let balance = initialBalance;
  
  transactions.forEach((transaction) => {
    balance = balance + (transaction.credit || 0) - (transaction.debit || 0);
  });
  
  return balance;
}

/**
 * محاسبه مجموع بدهکار
 */
export function getTotalDebit(transactions: BankTransaction[]): number {
  return transactions.reduce((sum, transaction) => {
    return sum + (transaction.debit || 0);
  }, 0);
}

/**
 * محاسبه مجموع بستانکار
 */
export function getTotalCredit(transactions: BankTransaction[]): number {
  return transactions.reduce((sum, transaction) => {
    return sum + (transaction.credit || 0);
  }, 0);
}

/**
 * پیدا کردن چک‌های نزدیک به موعد
 */
export function getUpcomingChecks(
  transactions: BankTransaction[],
  days: number = 7
): BankTransaction[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return transactions.filter((transaction) => {
    if (transaction.type !== 'received' || transaction.status === 'paid') {
      return false;
    }
    
    if (!transaction.dueDate) {
      return false;
    }
    
    const dueDate = new Date(transaction.dueDate);
    return dueDate <= futureDate && dueDate >= now;
  });
}

/**
 * فرمت ردیف دفتر بانک
 */
export function formatBankLedgerRow(
  transaction: BankTransaction,
  previousBalance: number
): BankTransaction {
  const newBalance = previousBalance + (transaction.credit || 0) - (transaction.debit || 0);
  
  return {
    ...transaction,
    balance: newBalance,
  };
}

/**
 * محاسبه مانده نهایی
 */
export function getFinalBalance(
  transactions: BankTransaction[],
  initialBalance: number
): number {
  return calculateAccountBalance(transactions, initialBalance);
}

/**
 * شمارش چک‌های دریافتی
 */
export function countReceivedChecks(transactions: BankTransaction[]): number {
  return transactions.filter((t) => t.type === 'received').length;
}

/**
 * شمارش چک‌های پرداختی
 */
export function countPaidChecks(transactions: BankTransaction[]): number {
  return transactions.filter((t) => t.type === 'paid').length;
}
