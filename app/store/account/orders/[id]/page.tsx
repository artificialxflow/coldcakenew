'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/ui';
import { formatPriceWithCurrency } from '@/lib/utils/price';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/store/orders/${params.id}`);
      if (res.ok) {
        setOrder(await res.json());
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500">سفارش یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">جزئیات سفارش #{order.orderNumber}</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">اطلاعات سفارش</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">وضعیت:</span>
              <span className="font-semibold mr-2">{order.status}</span>
            </div>
            <div>
              <span className="text-gray-600">وضعیت پرداخت:</span>
              <span className="font-semibold mr-2">{order.paymentStatus}</span>
            </div>
            <div>
              <span className="text-gray-600">روش پرداخت:</span>
              <span className="font-semibold mr-2">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-gray-600">تاریخ:</span>
              <span className="font-semibold mr-2">
                {new Date(order.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">محصولات</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-sm text-gray-500">تعداد: {item.quantity}</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold">
                    {formatPriceWithCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t flex justify-between items-center">
            <span className="text-lg font-bold">جمع کل:</span>
            <span className="text-2xl font-bold text-yellow-600">
              {formatPriceWithCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
