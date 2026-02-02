import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getGoldPriceHistory } from '@/lib/services/gold-price.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    const history = await getGoldPriceHistory(limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching gold price history:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تاریخچه قیمت طلا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
