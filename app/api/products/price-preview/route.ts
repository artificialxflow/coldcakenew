import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import { calculateNewProductPrice } from '@/lib/utils/goldPriceManager';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { goldPrice } = body;

    if (!goldPrice || typeof goldPrice.price !== 'number') {
      return NextResponse.json(
        { error: 'قیمت طلا الزامی است' },
        { status: 400 }
      );
    }

    // Get current gold price
    const currentGoldPrice = await prisma.goldPrice.findFirst({
      orderBy: { lastUpdate: 'desc' },
    });

    if (!currentGoldPrice) {
      return NextResponse.json(
        { error: 'قیمت طلای فعلی یافت نشد' },
        { status: 404 }
      );
    }

    // Get all products
    const products = await prisma.product.findMany();

    // Get settings for price increase percent
    const settings = await prisma.businessSettings.findFirst();
    const priceIncreasePercent = settings?.priceIncreasePercent || 10;

    // Calculate new prices
    const priceUpdates = products.map((product) => {
      const newPrice = calculateNewProductPrice(
        product.finalPrice,
        goldPrice.price,
        currentGoldPrice.yearlyHighest,
        priceIncreasePercent
      );

      return {
        productId: product.id,
        productName: product.name,
        previousPrice: product.finalPrice,
        newPrice,
        priceIncrease: newPrice - product.finalPrice,
        priceIncreasePercent: ((newPrice - product.finalPrice) / product.finalPrice) * 100,
      };
    });

    // Filter out products with no price change
    const affectedProducts = priceUpdates.filter((update) => update.priceIncrease !== 0);

    return NextResponse.json({
      totalProducts: products.length,
      productsAffected: affectedProducts.length,
      updates: affectedProducts,
      goldPrice: {
        current: currentGoldPrice.price,
        new: goldPrice.price,
        change: goldPrice.price - currentGoldPrice.price,
        changePercent: ((goldPrice.price - currentGoldPrice.price) / currentGoldPrice.price) * 100,
      },
    });
  } catch (error) {
    console.error('Error generating price preview:', error);
    return NextResponse.json(
      { error: 'خطا در تولید پیش‌نمایش قیمت', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
