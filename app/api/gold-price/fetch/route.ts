import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { fetchGoldPrice, calculatePriceChange } from '@/lib/services/gold-price-api.service';
import { getCurrentGoldPrice, updateGoldPrice } from '@/lib/services/gold-price.service';

/**
 * Fetch gold price from external API and update in database
 * This endpoint can be called manually or by n8n/cron
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    // Fetch price from external API
    const apiResponse = await fetchGoldPrice();

    if (!apiResponse || !apiResponse.price) {
      return NextResponse.json(
        { error: 'نمی‌توان قیمت طلا را از منبع خارجی دریافت کرد' },
        { status: 503 }
      );
    }

    // Get current price from database
    const currentGoldPrice = await getCurrentGoldPrice();

    let change = apiResponse.change || 0;
    let changePercent = apiResponse.changePercent || 0;

    // Calculate change if not provided by API
    if (currentGoldPrice && (!change && !changePercent)) {
      const calculated = calculatePriceChange(apiResponse.price, currentGoldPrice.price);
      change = calculated.change;
      changePercent = calculated.changePercent;
    }

    // Update in database
    const updated = await updateGoldPrice({
      price: apiResponse.price,
      change,
      changePercent,
    });

    return NextResponse.json({
      success: true,
      goldPrice: updated,
      source: process.env.N8N_WEBHOOK_URL ? 'n8n' : 'api',
    });
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return NextResponse.json(
      { 
        error: 'خطا در دریافت قیمت طلا', 
        message: error instanceof Error ? error.message : 'خطای نامشخص' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current gold price without updating
 */
export async function GET() {
  try {
    const currentPrice = await getCurrentGoldPrice();
    
    if (!currentPrice) {
      return NextResponse.json(
        { error: 'قیمت طلا در دیتابیس موجود نیست' },
        { status: 404 }
      );
    }

    return NextResponse.json(currentPrice);
  } catch (error) {
    console.error('Error getting gold price:', error);
    return NextResponse.json(
      { 
        error: 'خطا در دریافت قیمت طلا', 
        message: error instanceof Error ? error.message : 'خطای نامشخص' 
      },
      { status: 500 }
    );
  }
}
