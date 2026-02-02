'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import ProductGallery from '@/components/store/ProductGallery';
import PriceDisplay from '@/components/store/PriceDisplay';
import { Button, LoadingSpinner } from '@/components/ui';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/store/products/${params.id}`);
      if (res.ok) {
        setProduct(await res.json());
      } else {
        showToast('محصول یافت نشد', 'error');
        router.push('/store/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('خطا در بارگذاری محصول', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.priceType === 'call_for_price') {
      showToast('برای اطلاع از قیمت لطفاً با ما تماس بگیرید', 'warning');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Get or create session ID
      const { getCartSessionId } = await import('@/lib/utils/cartSession');
      getCartSessionId();

      const res = await fetch('/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (res.ok) {
        showToast('محصول به سبد خرید اضافه شد', 'success');
        router.push('/store/cart');
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در افزودن به سبد خرید', 'error');
      }
    } catch (error) {
      showToast('خطا در افزودن به سبد خرید', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <ProductGallery
                images={product.images || []}
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {product.category && (
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mb-4">
                  {product.category}
                </span>
              )}

              <div className="mb-6">
                <PriceDisplay product={product} />
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">توضیحات</h2>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {product.stock !== undefined && (
                <div className="mb-6">
                  <span className="text-gray-600">
                    موجودی: <strong>{product.stock > 0 ? `${product.stock} عدد` : 'ناموجود'}</strong>
                  </span>
                </div>
              )}

              {product.priceType !== 'call_for_price' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">تعداد</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock || 999, q + 1))}
                      className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
                className="w-full flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {addingToCart ? 'در حال افزودن...' : product.priceType === 'call_for_price' ? 'تماس بگیرید' : 'افزودن به سبد خرید'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
