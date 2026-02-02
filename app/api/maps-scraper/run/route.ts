import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { runScrape } from '@/lib/services/maps-scraper.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const body = await request.json();
    const { targetId } = body;

    if (!targetId) {
      return NextResponse.json(
        { error: 'targetId required' },
        { status: 400 }
      );
    }

    const run = await runScrape(targetId);

    return NextResponse.json(run);
  } catch (error) {
    console.error('Error running scrape:', error);
    return NextResponse.json(
      { error: 'خطا در اجرای اسکریپ', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
