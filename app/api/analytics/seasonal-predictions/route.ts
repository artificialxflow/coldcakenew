import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getSeasonalPredictions } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const predictions = await getSeasonalPredictions(user.id);

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching seasonal predictions:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پیش‌بینی‌های فصلی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
