'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cart, CartItem } from '@/types';
import { Button, LoadingSpinner, useToast } from '@/components/ui';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { formatPriceWithCurrency } from '@/lib/utils/price';

export default function CartPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      // Ensure session ID cookie is set
      const { getCartSessionId } = await import('@/lib/utils/cartSession');
      getCartSessionId();
      
      const res = await fetch('/api/store/cart', {
        credentials: 'include',
      });
      if (res.ok) {
        setCart(await res.json());
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      const res = await fetch(`/api/store/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        await loadCart();
      } else {
        showToast('خطا در به‌روزرسانی', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const res = await fetch(`/api/store/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadCart();
        showToast('محصول از سبد خرید حذف شد', 'success');
      } else {
        showToast('خطا در حذف', 'error');
      }
    } catch (error) {
      showToast('خطا در حذف', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      if (item.product?.priceType === 'call_for_price') return sum;
      return sum + (item.product?.finalPrice || 0) * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBagIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">سبد خرید شما خالی است</h2>
            <Link href="/store/products">
              <Button>مشاهده محصولات</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سبد خرید</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-4">
                  {item.product?.images && item.product.images.length > 0 && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.product?.name}</h3>
                    {item.product && (
                      <div className="text-yellow-600 font-semibold mb-4">
                        {item.product.priceType === 'call_for_price'
                          ? 'تماس بگیرید'
                          : formatPriceWithCurrency(item.product.finalPrice * item.quantity)}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id || (item.product?.stock !== undefined && item.quantity >= item.product.stock)}
                          className="px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">خلاصه سفارش</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>جمع کل:</span>
                  <span className="font-semibold">{formatPriceWithCurrency(calculateTotal())}</span>
                </div>
              </div>
              <Button
                onClick={() => router.push('/store/checkout')}
                className="w-full"
              >
                ادامه به تسویه حساب
              </Button>
              <Link href="/store/products" className="block text-center text-gray-600 hover:text-gray-900 mt-4">
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
