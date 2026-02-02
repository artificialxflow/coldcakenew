import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getContentById, updateContent, deleteContent } from '@/lib/services/content.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    const content = await getContentById(id);

    if (!content) {
      return NextResponse.json(
        { error: 'محتوا یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    const body = await request.json();
    const content = await updateContent(id, {
      ...body,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const { id } = await params;
    await deleteContent(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'خطا در حذف محتوا', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
