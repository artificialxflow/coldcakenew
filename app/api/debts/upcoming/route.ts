import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getUpcomingDebts } from '@/lib/services/debt.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    const debts = await getUpcomingDebts(user.id, days);

    return NextResponse.json(debts);
  } catch (error) {
    console.error('Error fetching upcoming debts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت طلب‌های آینده', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
