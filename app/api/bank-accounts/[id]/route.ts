import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBankAccountById, updateBankAccount, deleteBankAccount } from '@/lib/services/bank-ledger.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    const account = await getBankAccountById(id);

    if (!account) {
      return NextResponse.json(
        { error: 'حساب بانکی یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت حساب بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    const data = await request.json();
    const account = await updateBankAccount(id, data);

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی حساب بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    await deleteBankAccount(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'خطا در حذف حساب بانکی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
