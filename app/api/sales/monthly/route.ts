import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getMonthlySales } from '@/lib/services/sale.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    
    const total = await getMonthlySales(month, year, user.id);

    return NextResponse.json({ month, year, total });
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فروش ماهانه', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
