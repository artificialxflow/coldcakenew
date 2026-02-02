import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getContents, createContent } from '@/lib/services/content.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const contents = await getContents();

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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

    const body = await request.json();
    const content = await createContent({
      ...body,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
