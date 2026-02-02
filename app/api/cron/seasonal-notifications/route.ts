import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { seasonalNotificationsCron } from '@/lib/cron/seasonal-notifications';

/**
 * Cron endpoint for seasonal prediction notifications
 * Should run monthly (e.g., first day of each month)
 * Can be called by:
 * - n8n workflow (scheduled monthly)
 * - External cron service
 * - Manual trigger
 * 
 * Protected by CRON_SECRET in environment variables
 */
export async function POST(request: NextRequest) {
  try {
    // Option 1: Require authentication (if called manually)
    // Option 2: Use CRON_SECRET for cron services
    const cronSecret = request.headers.get('X-Cron-Secret');
    const expectedSecret = process.env.CRON_SECRET;

    let userId: string;

    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      // Called by cron service with secret
      const body = await request.json().catch(() => ({}));
      if (!body.userId) {
        return NextResponse.json(
          { error: 'userId required' },
          { status: 400 }
        );
      }
      userId = body.userId;
    } else {
      // Require normal authentication
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        return user;
      }
      userId = user.id;
    }

    // Get sendNotification flag from body (default: true)
    const body = await request.json().catch(() => ({}));
    const sendNotification = body.sendNotification !== false;

    // Run the cron job
    const result = await seasonalNotificationsCron(userId, sendNotification);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: {
        predictionsGenerated: result.predictionsGenerated,
        upcomingPredictions: result.upcomingPredictions,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in seasonal-notifications cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بررسی پیش‌بینی‌های فصلی',
        message: error instanceof Error ? error.message : 'خطای نامشخص',
      },
      { status: 500 }
    );
  }
}
