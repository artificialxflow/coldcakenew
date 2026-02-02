'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import PriceDisplay from './PriceDisplay';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const productUrl = product.slug 
    ? `/store/products/${product.slug}` 
    : `/store/products/${product.id}`;

  return (
    <Link href={productUrl} className="block group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {product.featured && (
            <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
              ویژه
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {product.name}
          </h3>
          
          {product.category && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mb-2">
              {product.category}
            </span>
          )}

          <PriceDisplay product={product} className="mt-2" />

          {product.stock !== undefined && product.stock > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              موجودی: {product.stock} عدد
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
