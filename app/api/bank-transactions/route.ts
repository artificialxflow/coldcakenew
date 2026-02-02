import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBankTransactions, createBankTransaction } from '@/lib/services/bank-ledger.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId required' },
        { status: 400 }
      );
    }

    const transactions = await getBankTransactions(accountId);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تراکنش‌های بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { accountId, ...transactionData } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId required' },
        { status: 400 }
      );
    }

    const transaction = await createBankTransaction(accountId, {
      ...transactionData,
      date: new Date(transactionData.date),
      dueDate: transactionData.dueDate ? new Date(transactionData.dueDate) : undefined,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating bank transaction:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تراکنش بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
