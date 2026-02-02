import { GoldPrice, Product } from '@/types';

export function shouldUpdateProductPrice(
  currentGoldPrice: number,
  yearlyHighest: number,
  increasePercent: number = 0
): boolean {
  // فقط اگر قیمت طلا بالاتر از بالاترین قیمت سالانه باشد
  return currentGoldPrice > yearlyHighest;
}

export function calculateNewProductPrice(
  currentPrice: number,
  goldPriceIncrease: number,
  yearlyHighest: number,
  increasePercent: number
): number {
  // اگر قیمت طلا بالاتر از بالاترین قیمت سالانه باشد
  if (goldPriceIncrease > yearlyHighest) {
    const increaseRatio = (goldPriceIncrease - yearlyHighest) / yearlyHighest;
    const priceIncrease = currentPrice * increaseRatio * (increasePercent / 100);
    return currentPrice + priceIncrease;
  }
  
  // در غیر این صورت قیمت تغییر نمی‌کند
  return currentPrice;
}

export function updateYearlyHighest(
  currentPrice: number,
  currentYearlyHighest: number
): { newHighest: number; updated: boolean } {
  if (currentPrice > currentYearlyHighest) {
    return {
      newHighest: currentPrice,
      updated: true,
    };
  }
  
  return {
    newHighest: currentYearlyHighest,
    updated: false,
  };
}

export function formatGoldPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export function getPriceTrend(currentPrice: number, previousPrice: number): 'up' | 'down' | 'stable' {
  const threshold = 0.01; // 1% threshold for stability
  
  if (currentPrice > previousPrice * (1 + threshold)) {
    return 'up';
  } else if (currentPrice < previousPrice * (1 - threshold)) {
    return 'down';
  }
  
  return 'stable';
}
