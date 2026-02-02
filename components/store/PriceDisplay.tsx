'use client';

import { Product } from '@/types';
import { displayPrice, isCallForPrice } from '@/lib/utils/price';

interface PriceDisplayProps {
  product: Product;
  className?: string;
}

export default function PriceDisplay({ product, className = '' }: PriceDisplayProps) {
  const callForPrice = isCallForPrice(product.priceType);

  if (callForPrice) {
    return (
      <div className={`text-lg font-semibold text-yellow-600 ${className}`}>
        تماس بگیرید
      </div>
    );
  }

  return (
    <div className={className}>
      {product.discountedPrice && product.discountedPrice < product.originalPrice ? (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-yellow-600">
            {displayPrice(product)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {new Intl.NumberFormat('fa-IR').format(product.originalPrice)} تومان
          </span>
        </div>
      ) : (
        <span className="text-lg font-semibold text-yellow-600">
          {displayPrice(product)}
        </span>
      )}
    </div>
  );
}
