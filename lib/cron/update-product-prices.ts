/**
 * Cron job to update product prices based on gold price
 * This should be called daily at end of day (e.g., 23:59)
 * Can be triggered by n8n workflow or external cron service
 */

import { prisma } from '../db/prisma';
import { updateProductPricesBasedOnGold } from '../services/product.service';
import { fetchGoldPrice, calculatePriceChange } from '../services/gold-price-api.service';
import { getCurrentGoldPrice, updateGoldPrice } from '../services/gold-price.service';
import { updateYearlyHighest } from '../utils/goldPriceManager';

interface UpdateResult {
  success: boolean;
  goldPriceUpdated: boolean;
  productsUpdated: number;
  productsSkipped: number;
  message: string;
}

/**
 * Main function to update gold price and product prices
 */
export async function updateProductPricesCron(
  userId: string,
  priceIncreasePercent: number = 100 // Percentage of gold price increase to apply to products
): Promise<UpdateResult> {
  try {
    // Step 1: Fetch latest gold price from external API
    console.log('[CRON] Fetching gold price from external API...');
    const apiResponse = await fetchGoldPrice();

    if (!apiResponse || !apiResponse.price) {
      return {
        success: false,
        goldPriceUpdated: false,
        productsUpdated: 0,
        productsSkipped: 0,
        message: 'نمی‌توان قیمت طلا را از منبع خارجی دریافت کرد',
      };
    }

    // Step 2: Get current gold price from database
    const currentGoldPrice = await getCurrentGoldPrice();

    let change = apiResponse.change || 0;
    let changePercent = apiResponse.changePercent || 0;

    // Calculate change if not provided
    if (currentGoldPrice && (!change && !changePercent)) {
      const calculated = calculatePriceChange(apiResponse.price, currentGoldPrice.price);
      change = calculated.change;
      changePercent = calculated.changePercent;
    }

    // Step 3: Update gold price in database
    console.log('[CRON] Updating gold price in database...');
    const updatedGoldPrice = await updateGoldPrice({
      price: apiResponse.price,
      change,
      changePercent,
    });

    // Step 4: Check if we should update product prices
    // Only if new price > yearly highest
    const yearlyHighestUpdate = updateYearlyHighest(
      apiResponse.price,
      currentGoldPrice?.yearlyHighest || 0
    );

    if (!yearlyHighestUpdate.updated) {
      // Price didn't exceed yearly highest, no need to update products
      console.log('[CRON] Gold price did not exceed yearly highest. Skipping product price updates.');
      return {
        success: true,
        goldPriceUpdated: true,
        productsUpdated: 0,
        productsSkipped: 0,
        message: 'قیمت طلا به‌روز شد اما از بالاترین قیمت سال بیشتر نشد. قیمت محصولات تغییر نکرد.',
      };
    }

    // Step 5: Update product prices
    console.log('[CRON] Updating product prices...');
    const productUpdateResult = await updateProductPricesBasedOnGold(
      userId,
      priceIncreasePercent
    );

    return {
      success: true,
      goldPriceUpdated: true,
      productsUpdated: productUpdateResult.updated,
      productsSkipped: productUpdateResult.skipped,
      message: `قیمت طلا به‌روز شد. ${productUpdateResult.updated} محصول به‌روزرسانی شد، ${productUpdateResult.skipped} محصول بدون تغییر ماند.`,
    };
  } catch (error) {
    console.error('[CRON] Error updating product prices:', error);
    return {
      success: false,
      goldPriceUpdated: false,
      productsUpdated: 0,
      productsSkipped: 0,
      message: error instanceof Error ? error.message : 'خطای نامشخص',
    };
  } finally {
    await prisma.$disconnect();
  }
}
