import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getDebts, createDebt } from '@/lib/services/debt.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'paid' | 'pending' | undefined;
    const customerId = searchParams.get('customerId') || undefined;
    
    const debts = await getDebts(user.id, {
      status,
      customerId,
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error('Error fetching debts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت طلب‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    const debt = await createDebt(user.id, {
      ...body,
      dueDate: new Date(body.dueDate),
      receiveDate: body.receiveDate ? new Date(body.receiveDate) : undefined,
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    console.error('Error creating debt:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد طلب', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
