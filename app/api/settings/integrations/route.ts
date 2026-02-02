import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getIntegrationSettings, updateIntegrationSettings } from '@/lib/services/settings.service';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user; // Return error response
    }
    
    const settings = await getIntegrationSettings();
    
    // Don't return sensitive data in full - mask secrets
    const maskedSettings = {
      ...settings,
      googleCloudClientSecret: settings.googleCloudClientSecret
        ? '•'.repeat(20) + (settings.googleCloudClientSecret.slice(-4))
        : null,
      geminiApiKey: settings.geminiApiKey
        ? settings.geminiApiKey.slice(0, 8) + '•'.repeat(20)
        : null,
      openAiApiKey: settings.openAiApiKey
        ? settings.openAiApiKey.slice(0, 8) + '•'.repeat(20)
        : null,
    };
    
    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error fetching integration settings:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تنظیمات یکپارچه‌سازی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
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
    const settings = await updateIntegrationSettings(data);
    
    // Return masked version
    const maskedSettings = {
      ...settings,
      googleCloudClientSecret: settings.googleCloudClientSecret
        ? '•'.repeat(20) + (settings.googleCloudClientSecret.slice(-4))
        : null,
      geminiApiKey: settings.geminiApiKey
        ? settings.geminiApiKey.slice(0, 8) + '•'.repeat(20)
        : null,
      openAiApiKey: settings.openAiApiKey
        ? settings.openAiApiKey.slice(0, 8) + '•'.repeat(20)
        : null,
    };
    
    return NextResponse.json(maskedSettings);
  } catch (error) {
    console.error('Error updating integration settings:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('فرمت')) {
      return NextResponse.json(
        { error: 'خطای اعتبارسنجی', message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'خطا در بروزرسانی تنظیمات یکپارچه‌سازی', message: error instanceof Error ? error.message : 'خطای نامشخص' },
      { status: 500 }
    );
  }
}
