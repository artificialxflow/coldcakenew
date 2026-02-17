import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get active categories from Category table
    const categoryRecords = await prisma.category.findMany({
      where: {
        active: true,
      },
      select: {
        name: true,
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    // Also get categories from products (for backward compatibility with products that don't have categoryId yet)
    const products = await prisma.product.findMany({
      where: {
        category: { not: null },
        categoryId: null, // Only products without categoryId
        priceType: { in: ['fixed', 'call_for_price', 'negotiable'] },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const productCategories = products
      .map((p) => p.category)
      .filter((cat): cat is string => cat !== null);

    // Combine and deduplicate
    const categoryNames = new Set<string>();
    categoryRecords.forEach((cat) => categoryNames.add(cat.name));
    productCategories.forEach((cat) => categoryNames.add(cat));

    return NextResponse.json(Array.from(categoryNames).sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت دسته‌بندی‌ها', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
