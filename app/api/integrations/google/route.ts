import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { getIntegrationSettings } from '@/lib/services/settings.service';

/**
 * API endpoint برای Google Apps Script
 * این endpoint به GAS اجازه می‌دهد به داده‌های Cold Cake دسترسی داشته باشد
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication با API key یا OAuth token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // TODO: Verify token (می‌توانید از JWT یا API key استفاده کنید)
    // برای حالا، یک API key ساده از env یا settings استفاده می‌کنیم
    const settings = await getIntegrationSettings();
    
    // Simple token verification (in production, use proper JWT verification)
    // You can also generate API keys and store them in database
    
    const body = await request.json();
    const { action, data } = body;

    // Actions supported for Google Apps Script
    switch (action) {
      case 'get_customers':
        // Redirect to customers API
        return NextResponse.json({
          redirect: '/api/customers',
          message: 'Use /api/customers endpoint with authentication'
        });

      case 'get_products':
        return NextResponse.json({
          redirect: '/api/products',
          message: 'Use /api/products endpoint with authentication'
        });

      case 'get_reports':
        return NextResponse.json({
          redirect: '/api/reports/summary',
          message: 'Use /api/reports/summary endpoint with authentication'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', message: 'Supported actions: get_customers, get_products, get_reports' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Google Apps Script integration:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint برای دریافت اطلاعات integration
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (user instanceof NextResponse) {
      return user;
    }

    const settings = await getIntegrationSettings();
    
    return NextResponse.json({
      googleCloudEnabled: !!(settings.googleCloudClientId && settings.googleCloudClientSecret),
      apiEndpoints: {
        customers: '/api/customers',
        products: '/api/products',
        sales: '/api/sales',
        reports: '/api/reports/summary'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
