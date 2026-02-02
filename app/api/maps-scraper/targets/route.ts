import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getScrapeTargets, createScrapeTarget } from '@/lib/services/maps-scraper.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const targets = await getScrapeTargets();

    return NextResponse.json(targets);
  } catch (error) {
    console.error('Error fetching scrape targets:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اهداف اسکریپ', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const data = await request.json();
    const target = await createScrapeTarget(data);

    return NextResponse.json(target, { status: 201 });
  } catch (error) {
    console.error('Error creating scrape target:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد هدف اسکریپ', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
