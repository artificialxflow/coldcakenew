import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getSummaryReport } from '@/lib/services/report.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    
    const report = await getSummaryReport(user.id, month, year);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating summary report:', error);
    return NextResponse.json(
      { error: 'خطا در تولید گزارش خلاصه', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
