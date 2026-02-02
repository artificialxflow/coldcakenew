import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCustomerInterests } from '@/lib/services/customer.service';

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
    const interests = await getCustomerInterests(id, user.id);

    return NextResponse.json(interests);
  } catch (error) {
    console.error('Error fetching customer interests:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت علاقه‌مندی‌های مشتری', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
