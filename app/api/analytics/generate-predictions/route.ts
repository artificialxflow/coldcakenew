import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { generatePredictions } from '@/lib/services/analytics.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const predictions = await generatePredictions(user.id);

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: 'خطا در تولید پیش‌بینی‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
