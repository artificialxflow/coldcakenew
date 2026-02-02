import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getDebtById, updateDebt, deleteDebt } from '@/lib/services/debt.service';

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
    const debt = await getDebtById(id, user.id);

    if (!debt) {
      return NextResponse.json(
        { error: 'طلب یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(debt);
  } catch (error) {
    console.error('Error fetching debt:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت طلب', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    const body = await request.json();
    const debt = await updateDebt(id, user.id, {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      receiveDate: body.receiveDate ? new Date(body.receiveDate) : undefined,
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error('Error updating debt:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی طلب', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    await deleteDebt(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting debt:', error);
    return NextResponse.json(
      { error: 'خطا در حذف طلب', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
