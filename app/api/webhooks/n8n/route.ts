import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationSettings } from '@/lib/services/settings.service';

/**
 * Webhook endpoint برای دریافت trigger از n8n
 * این endpoint به n8n اجازه می‌دهد رویدادها را به Cold Cake ارسال کند
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    // Verify webhook URL (optional - can add secret verification)
    const settings = await getIntegrationSettings();
    
    if (!settings.n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'n8n webhook not configured' },
        { status: 400 }
      );
    }

    // Verify the request is coming from configured n8n URL
    const origin = request.headers.get('origin') || request.headers.get('referer');
    // Optional: Add secret verification here

    // Handle different event types
    switch (event) {
      case 'workflow_completed':
        console.log('n8n workflow completed:', data);
        // Handle workflow completion
        break;

      case 'workflow_failed':
        console.error('n8n workflow failed:', data);
        // Handle workflow failure
        break;

      case 'custom_trigger':
        console.log('n8n custom trigger received:', data);
        // Handle custom trigger
        break;

      default:
        console.log('Unknown n8n event:', event, data);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      receivedEvent: event 
    });
  } catch (error) {
    console.error('Error processing n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint برای بررسی وضعیت webhook
 */
export async function GET(request: NextRequest) {
  const settings = await getIntegrationSettings();
  
  return NextResponse.json({
    webhookConfigured: !!settings.n8nWebhookUrl,
    status: 'active',
    supportedEvents: [
      'workflow_completed',
      'workflow_failed',
      'custom_trigger'
    ]
  });
}
