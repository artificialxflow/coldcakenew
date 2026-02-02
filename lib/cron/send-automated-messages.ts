/**
 * Cron job to send automated personalized messages to customers
 * This should be called daily/weekly/monthly based on settings
 * Can be triggered by n8n workflow or external cron service
 */

import { prisma } from '../db/prisma';
import { runAutomatedMessaging } from '../services/message.service';
import { shouldRunAutomatedMessaging } from '../utils/automatedMessaging';

interface SendMessagesResult {
  success: boolean;
  runId?: string;
  totalCustomers: number;
  sentMessages: number;
  failedMessages: number;
  successRate: number;
  message: string;
}

/**
 * Main function to send automated messages
 */
export async function sendAutomatedMessagesCron(userId: string): Promise<SendMessagesResult> {
  try {
    // Get settings
    const settings = await prisma.businessSettings.findFirst({
      where: {
        // You might want to filter by userId if multiple users
      },
    });

    if (!settings || !settings.automatedMessaging) {
      return {
        success: false,
        totalCustomers: 0,
        sentMessages: 0,
        failedMessages: 0,
        successRate: 0,
        message: 'پیام‌رسانی خودکار پیکربندی نشده است',
      };
    }

    const automatedSettings = settings.automatedMessaging as any;

    if (!automatedSettings.enabled) {
      return {
        success: false,
        totalCustomers: 0,
        sentMessages: 0,
        failedMessages: 0,
        successRate: 0,
        message: 'پیام‌رسانی خودکار غیرفعال است',
      };
    }

    // Check if we should run (based on frequency and last run)
    const lastRun = await prisma.automatedMessageRun.findFirst({
      orderBy: { executedAt: 'desc' },
    });

    const shouldRun = shouldRunAutomatedMessaging(
      automatedSettings,
      lastRun?.executedAt?.toISOString()
    );

    if (!shouldRun) {
      return {
        success: true,
        totalCustomers: 0,
        sentMessages: 0,
        failedMessages: 0,
        successRate: 0,
        message: 'زمان ارسال پیام خودکار نرسیده است',
      };
    }

    // Run automated messaging
    console.log('[CRON] Running automated messaging...');
    const run = await runAutomatedMessaging(userId);

    return {
      success: run.status === 'completed',
      runId: run.id,
      totalCustomers: run.totalCustomers,
      sentMessages: run.sentMessages,
      failedMessages: run.failedMessages,
      successRate: run.successRate,
      message: run.status === 'completed'
        ? `پیام خودکار با موفقیت ارسال شد. ${run.sentMessages} پیام ارسال شد.`
        : `خطا در ارسال پیام خودکار: ${run.error || 'خطای نامشخص'}`,
    };
  } catch (error) {
    console.error('[CRON] Error sending automated messages:', error);
    return {
      success: false,
      totalCustomers: 0,
      sentMessages: 0,
      failedMessages: 0,
      successRate: 0,
      message: error instanceof Error ? error.message : 'خطای نامشخص',
    };
  } finally {
    await prisma.$disconnect();
  }
}
