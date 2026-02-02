import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
        seoTitle: true,
        seoDescription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'محصول یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصول', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
