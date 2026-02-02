import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { updateProductPricesCron } from '@/lib/cron/update-product-prices';

/**
 * Cron endpoint for updating product prices based on gold price
 * Can be called by:
 * - n8n workflow (scheduled daily at end of day)
 * - External cron service (e.g., cron-job.org)
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
      // Get first user ID (in single-user systems) or from request
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        // If no auth, try to get from request body or use default
        const body = await request.json().catch(() => ({}));
        if (!body.userId) {
          return NextResponse.json(
            { error: 'userId required' },
            { status: 400 }
          );
        }
        userId = body.userId;
      } else {
        userId = user.id;
      }
    } else {
      // Require normal authentication
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        return user;
      }
      userId = user.id;
    }

    // Get price increase percent from request body (optional, default 100%)
    const body = await request.json().catch(() => ({}));
    const priceIncreasePercent = body.priceIncreasePercent || 100;

    // Run the cron job
    const result = await updateProductPricesCron(userId, priceIncreasePercent);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: {
        goldPriceUpdated: result.goldPriceUpdated,
        productsUpdated: result.productsUpdated,
        productsSkipped: result.productsSkipped,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in update-product-prices cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در به‌روزرسانی قیمت محصولات',
        message: error instanceof Error ? error.message : 'خطای نامشخص',
      },
      { status: 500 }
    );
  }
}
