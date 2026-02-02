'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cart } from '@/types';
import { Button, Input, LoadingSpinner, useToast } from '@/components/ui';
import { formatPriceWithCurrency } from '@/lib/utils/price';

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'manual' as 'online' | 'phone' | 'manual' | 'cash_on_delivery',
    notes: '',
  });

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
        const cartData = await res.json();
        setCart(cartData);
      } else {
        router.push('/store/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => {
      if (item.product?.priceType === 'call_for_price') return sum;
      return sum + (item.product?.finalPrice || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || !cart.items || cart.items.length === 0) {
      showToast('سبد خرید شما خالی است', 'warning');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      showToast('لطفاً نام و شماره تماس را وارد کنید', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      // Create order
      const orderRes = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail || undefined,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || undefined,
          items: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product?.name || '',
            quantity: item.quantity,
            unitPrice: item.product?.finalPrice || 0,
          })),
        }),
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        showToast(error.message || 'خطا در ثبت سفارش', 'error');
        return;
      }

      const order = await orderRes.json();

      // Handle payment
      if (formData.paymentMethod === 'online') {
        const paymentRes = await fetch('/api/store/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentMethod: 'online',
          }),
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl;
            return;
          }
        }
      }

      // For manual payments, redirect to order page
      showToast('سفارش شما با موفقیت ثبت شد', 'success');
      router.push(`/store/account/orders/${order.id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast('خطا در ثبت سفارش', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    router.push('/store/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">تسویه حساب</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">اطلاعات تماس</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نام و نام خانوادگی *</label>
                  <Input
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="نام و نام خانوادگی"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">شماره تماس *</label>
                  <Input
                    required
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="09123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ایمیل (اختیاری)</label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">روش پرداخت</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="manual"
                    checked={formData.paymentMethod === 'manual'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  />
                  <span>پرداخت دستی (تماس تلفنی)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="phone"
                    checked={formData.paymentMethod === 'phone'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  />
                  <span>هماهنگی تلفنی</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  />
                  <span>پرداخت آنلاین (زرین‌پال)</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium mb-2">یادداشت (اختیاری)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded-lg p-3 min-h-24"
                placeholder="یادداشت یا درخواست خاص..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">خلاصه سفارش</h2>
              <div className="space-y-2 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span>
                      {item.product?.priceType === 'call_for_price'
                        ? 'تماس بگیرید'
                        : formatPriceWithCurrency((item.product?.finalPrice || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>جمع کل:</span>
                  <span>{formatPriceWithCurrency(calculateTotal())}</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? <LoadingSpinner size="sm" /> : 'ثبت سفارش'}
              </Button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
