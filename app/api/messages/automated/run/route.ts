import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { runAutomatedMessaging } from '@/lib/services/message.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const run = await runAutomatedMessaging(user.id);

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error running automated messaging:', error);
    return NextResponse.json(
      { error: 'خطا در اجرای پیام‌رسانی خودکار', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
