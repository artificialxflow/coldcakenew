'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/ui';
import { formatPriceWithCurrency } from '@/lib/utils/price';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/store/orders');
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'processing':
        return 'در حال پردازش';
      case 'cancelled':
        return 'لغو شده';
      default:
        return 'در انتظار';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">سفارش‌های من</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
            <Link href="/store/products">
              <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700">
                مشاهده محصولات
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/store/account/orders/${order.id}`}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">سفارش #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                      <div className="mt-2 text-lg font-bold text-yellow-600">
                        {formatPriceWithCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.length} آیتم
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
