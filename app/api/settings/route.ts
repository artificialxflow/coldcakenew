import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getBusinessSettings, updateBusinessSettings } from '@/lib/services/settings.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user; // Return error response
    }
    
    const settings = await getBusinessSettings();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user; // Return error response
    }
    
    const data = await request.json();
    const settings = await updateBusinessSettings(data);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی تنظیمات', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
