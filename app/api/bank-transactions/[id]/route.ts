import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { updateBankTransaction, deleteBankTransaction } from '@/lib/services/bank-ledger.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    const body = await request.json();
    const data = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    };
    const transaction = await updateBankTransaction(id, data);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating bank transaction:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی تراکنش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    await deleteBankTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank transaction:', error);
    return NextResponse.json(
      { error: 'خطا در حذف تراکنش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
