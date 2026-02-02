import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getSaleById, updateSale } from '@/lib/services/sale.service';

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
    const sale = await getSaleById(id, user.id);

    if (!sale) {
      return NextResponse.json(
        { error: 'فروش یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فروش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    const sale = await updateSale(id, user.id, {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی فروش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
