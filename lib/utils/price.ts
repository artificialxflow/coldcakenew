/**
 * Format price to Persian number format
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price);
}

/**
 * Format price with currency
 */
export function formatPriceWithCurrency(price: number, currency: string = 'تومان'): string {
  return `${formatPrice(price)} ${currency}`;
}

/**
 * Display price or "call for price" message
 */
export function displayPrice(
  product: { priceType?: string; finalPrice?: number },
  callForPriceText: string = 'تماس بگیرید'
): string {
  if (product.priceType === 'call_for_price') {
    return callForPriceText;
  }
  if (product.finalPrice) {
    return formatPriceWithCurrency(product.finalPrice);
  }
  return callForPriceText;
}

/**
 * Check if product has call for price
 */
export function isCallForPrice(priceType?: string): boolean {
  return priceType === 'call_for_price';
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(originalPrice: number, finalPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}
