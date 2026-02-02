import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBankAccountById, getBankTransactions } from '@/lib/services/bank-ledger.service';
import { exportBankLedgerToExcel, exportBankLedgerToPDF } from '@/lib/utils/exportReports';
import { BankTransaction, BankAccount } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const format = searchParams.get('format') as 'excel' | 'pdf' | null;

    if (!accountId) {
      return NextResponse.json(
        { error: 'شناسه حساب بانکی الزامی است' },
        { status: 400 }
      );
    }

    const account = await getBankAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { error: 'حساب بانکی یافت نشد' },
        { status: 404 }
      );
    }

    const transactions = await getBankTransactions(accountId);
    
    // Format transactions
    const formattedTransactions: BankTransaction[] = transactions.map((t: Awaited<ReturnType<typeof getBankTransactions>>[0]) => ({
      id: t.id,
      accountId: t.accountId,
      accountNumber: t.accountNumber,
      date: t.date.toISOString(),
      type: t.type as 'received' | 'paid',
      checkNumber: t.checkNumber || undefined,
      paidCheckNumber: t.paidCheckNumber || undefined,
      description: t.description || undefined,
      debit: t.debit || undefined,
      credit: t.credit || undefined,
      balance: (t as any).balance || 0,
      rowNumber: t.rowNumber,
      customerId: t.customerId || undefined,
      customerName: t.customerName || undefined,
      bank: t.bank || undefined,
      dueDate: t.dueDate?.toISOString(),
      status: t.status ? (t.status as 'pending' | 'paid') : undefined,
    }));

    const formattedAccount: BankAccount = {
      id: account.id,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountType: account.accountType as 'current' | 'savings' | 'other',
      initialBalance: account.initialBalance,
      currentBalance: account.currentBalance,
      createdAt: account.createdAt?.toISOString() || new Date().toISOString(),
    };

    const exportFormat = format || 'excel';

    // Note: Since we're in an API route, we can't directly call browser download functions
    // The frontend should handle the actual file generation using the returned data
    return NextResponse.json({
      format: exportFormat,
      account: formattedAccount,
      transactions: formattedTransactions,
      message: 'برای دانلود فایل، از توابع exportBankLedgerToExcel یا exportBankLedgerToPDF در frontend استفاده کنید.',
    });
  } catch (error) {
    console.error('Error exporting bank ledger:', error);
    return NextResponse.json(
      { error: 'خطا در خروجی گرفتن دفتر بانک', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
