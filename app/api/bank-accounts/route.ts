import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBankAccounts, createBankAccount } from '@/lib/services/bank-ledger.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const accounts = await getBankAccounts(user.id);

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت حساب‌های بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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

    const data = await request.json();
    const account = await createBankAccount(data);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد حساب بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
