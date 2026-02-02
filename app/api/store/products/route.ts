import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.finalPrice = {};
      if (minPrice !== undefined) {
        where.finalPrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.finalPrice.lte = maxPrice;
      }
    }

    // Only show products with fixed price or call_for_price (not hidden products)
    where.priceType = { in: ['fixed', 'call_for_price', 'negotiable'] };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          originalPrice: true,
          discountedPrice: true,
          finalPrice: true,
          priceType: true,
          category: true,
          stock: true,
          description: true,
          images: true,
          featured: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
