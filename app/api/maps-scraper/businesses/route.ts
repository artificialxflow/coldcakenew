import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getScrapedBusinesses } from '@/lib/services/maps-scraper.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const targetId = searchParams.get('targetId') || undefined;
    
    const businesses = await getScrapedBusinesses(targetId);

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error fetching scraped businesses:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کسب‌وکارهای اسکریپ شده', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
