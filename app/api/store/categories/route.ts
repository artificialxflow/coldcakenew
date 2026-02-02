import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: { not: null },
        priceType: { in: ['fixed', 'call_for_price', 'negotiable'] },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = products
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
