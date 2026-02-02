/**
 * Cron job for seasonal prediction notifications
 * Notifies user 1 month before products become popular in next season
 * Should run monthly (e.g., first day of each month)
 */

import { prisma } from '../db/prisma';
import { generatePredictions, getSeasonalPredictions } from '../services/analytics.service';
import { getCurrentSeason } from '../utils/seasonalPredictor';

interface SeasonalNotificationResult {
  success: boolean;
  predictionsGenerated: number;
  upcomingPredictions: number;
  message: string;
}

/**
 * Get upcoming season predictions (products that will be popular 1-3 months from now)
 */
function getUpcomingSeasonPredictions(predictions: any[], monthsAhead: number = 1) {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setMonth(targetDate.getMonth() + monthsAhead);

  return predictions.filter((pred) => {
    const recommendationDate = new Date(pred.recommendationDate);
    const monthDiff = (targetDate.getMonth() - recommendationDate.getMonth()) + 
                      (targetDate.getFullYear() - recommendationDate.getFullYear()) * 12;
    
    // Include predictions that recommend purchase 1 month before the season
    return monthDiff >= 0 && monthDiff <= 1;
  });
}

/**
 * Format notification message for user
 */
function formatSeasonalNotificationMessage(predictions: any[]): string {
  if (predictions.length === 0) {
    return 'هیچ پیش‌بینی فصلی برای ماه آینده وجود ندارد.';
  }

  const currentSeason = getCurrentSeason();
  const seasonNames: Record<string, string> = {
    spring: 'بهار',
    summer: 'تابستان',
    fall: 'پاییز',
    winter: 'زمستان',
  };

  let message = `📊 هشدار پیش‌بینی فصلی - 1 ماه قبل\n\n`;
  message += `بر اساس تحلیل فروش‌های قبلی و روند بازار، محصولات زیر در ${seasonNames[predictions[0]?.season || currentSeason]} آینده پرفروش خواهند بود:\n\n`;

  predictions.slice(0, 10).forEach((pred, index) => {
    message += `${index + 1}. ${pred.productName}\n`;
    message += `   فصل: ${seasonNames[pred.season]}\n`;
    message += `   پیش‌بینی فروش: ${pred.predictedSales} عدد\n`;
    message += `   اولویت: ${pred.priority}\n`;
    message += `   اعتماد: ${(pred.confidence * 100).toFixed(0)}%\n`;
    if (pred.reason) {
      message += `   دلیل: ${pred.reason}\n`;
    }
    message += `\n`;
  });

  if (predictions.length > 10) {
    message += `و ${predictions.length - 10} محصول دیگر...\n\n`;
  }

  message += `💡 پیشنهاد: برای جلوگیری از کمبود موجودی، بهتر است از همین الان موجودی این محصولات را تهیه کنید.\n`;

  return message;
}

/**
 * Main function to check and send seasonal notifications
 */
export async function seasonalNotificationsCron(
  userId: string,
  sendNotification: boolean = true
): Promise<SeasonalNotificationResult> {
  try {
    console.log('[CRON] Checking seasonal predictions...');

    // Generate/refresh predictions
    const predictions = await getSeasonalPredictions(userId);

    if (!predictions || predictions.length === 0) {
      // Try to generate new predictions
      console.log('[CRON] No predictions found, generating new ones...');
      await generatePredictions(userId);
      const refreshed = await getSeasonalPredictions(userId);
      
      if (!refreshed || refreshed.length === 0) {
        return {
          success: false,
          predictionsGenerated: 0,
          upcomingPredictions: 0,
          message: 'نمی‌توان پیش‌بینی فصلی تولید کرد (داده کافی نیست)',
        };
      }
    }

    // Get predictions for next 1-3 months
    const upcomingPredictions = getUpcomingSeasonPredictions(predictions, 1);

    if (upcomingPredictions.length === 0) {
      return {
        success: true,
        predictionsGenerated: predictions.length,
        upcomingPredictions: 0,
        message: 'هیچ پیش‌بینی فصلی برای ماه آینده وجود ندارد',
      };
    }

    // Format notification message
    const notificationMessage = formatSeasonalNotificationMessage(upcomingPredictions);

    if (sendNotification) {
      // TODO: Send notification via Email or Telegram
      // For now, we'll just log it
      console.log('[CRON] Seasonal notification:', notificationMessage);

      // You can integrate with email service or Telegram bot here
      // Example:
      // await sendEmail(userId, 'هشدار پیش‌بینی فصلی', notificationMessage);
      // or
      // await sendTelegramMessage(userId, notificationMessage);
    }

    return {
      success: true,
      predictionsGenerated: predictions.length,
      upcomingPredictions: upcomingPredictions.length,
      message: notificationMessage,
    };
  } catch (error) {
    console.error('[CRON] Error in seasonal notifications:', error);
    return {
      success: false,
      predictionsGenerated: 0,
      upcomingPredictions: 0,
      message: error instanceof Error ? error.message : 'خطای نامشخص',
    };
  } finally {
    await prisma.$disconnect();
  }
}
