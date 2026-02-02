import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getCurrentGoldPrice } from '@/lib/services/gold-price.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const goldPrice = await getCurrentGoldPrice();

    if (!goldPrice) {
      return NextResponse.json(
        { error: 'قیمت طلا یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(goldPrice);
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت قیمت طلا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
