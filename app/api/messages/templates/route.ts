import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getMessageTemplates, createMessageTemplate } from '@/lib/services/message.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const templates = await getMessageTemplates();

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت قالب‌های پیام', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    const template = await createMessageTemplate(data);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد قالب پیام', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
