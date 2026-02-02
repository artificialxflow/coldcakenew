import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { updateGoldPrice } from '@/lib/services/gold-price.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const data = await request.json();
    const goldPrice = await updateGoldPrice(data);

    return NextResponse.json(goldPrice);
  } catch (error) {
    console.error('Error updating gold price:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی قیمت طلا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
