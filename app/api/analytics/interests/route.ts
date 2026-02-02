import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCustomerInterests } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const interests = await getCustomerInterests(user.id);

    return NextResponse.json(interests);
  } catch (error) {
    console.error('Error fetching customer interests:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت علاقه‌مندی‌های مشتریان', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
