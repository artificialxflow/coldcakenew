import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { sendAutomatedMessagesCron } from '@/lib/cron/send-automated-messages';

/**
 * Cron endpoint for sending automated personalized messages
 * Can be called by:
 * - n8n workflow (scheduled daily/weekly/monthly)
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

    // Run the cron job
    const result = await sendAutomatedMessagesCron(userId);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: {
        runId: result.runId,
        totalCustomers: result.totalCustomers,
        sentMessages: result.sentMessages,
        failedMessages: result.failedMessages,
        successRate: result.successRate,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in send-automated-messages cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ارسال پیام خودکار',
        message: error instanceof Error ? error.message : 'خطای نامشخص',
      },
      { status: 500 }
    );
  }
}
