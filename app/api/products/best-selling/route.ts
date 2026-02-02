import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBestSellingProducts } from '@/lib/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const products = await getBestSellingProducts(limit);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محصولات پرفروش', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
