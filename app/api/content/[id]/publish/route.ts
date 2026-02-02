import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { publishContent } from '@/lib/services/content.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    const content = await publishContent(id);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error publishing content:', error);
    return NextResponse.json(
      { error: 'خطا در انتشار محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
