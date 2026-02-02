'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, Button, useToast } from '@/components/ui';
import { Order } from '@/types';
import { formatPriceWithCurrency } from '@/lib/utils/price';

export default function OrderDetailPage() {
  const params = useParams();
  const { showToast, ToastContainer } = useToast();
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

  const updateStatus = async (status: string, paymentStatus?: string) => {
    if (!order) return;

    try {
      const res = await fetch(`/api/store/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (res.ok) {
        showToast('وضعیت به‌روزرسانی شد', 'success');
        loadOrder();
      } else {
        showToast('خطا در به‌روزرسانی', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی', 'error');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="جزئیات سفارش">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="جزئیات سفارش">
        <p className="text-center text-gray-500">سفارش یافت نشد</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`سفارش #${order.orderNumber}`}>
      <div className="space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات سفارش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600">وضعیت:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="block mt-1 border rounded-lg p-2"
                >
                  <option value="pending">در انتظار</option>
                  <option value="processing">در حال پردازش</option>
                  <option value="completed">تکمیل شده</option>
                  <option value="cancelled">لغو شده</option>
                </select>
              </div>
              <div>
                <span className="text-gray-600">وضعیت پرداخت:</span>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updateStatus(order.status, e.target.value)}
                  className="block mt-1 border rounded-lg p-2"
                >
                  <option value="pending">در انتظار</option>
                  <option value="paid">پرداخت شده</option>
                  <option value="failed">ناموفق</option>
                </select>
              </div>
              <div>
                <span className="text-gray-600">روش پرداخت:</span>
                <p className="font-semibold">{order.paymentMethod}</p>
              </div>
              <div>
                <span className="text-gray-600">تاریخ:</span>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات مشتری</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">نام:</span>
                <p className="font-semibold">{order.customerName}</p>
              </div>
              <div>
                <span className="text-gray-600">شماره تماس:</span>
                <p className="font-semibold">{order.customerPhone}</p>
              </div>
              {order.customerEmail && (
                <div>
                  <span className="text-gray-600">ایمیل:</span>
                  <p className="font-semibold">{order.customerEmail}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>محصولات</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>یادداشت</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <ToastContainer />
    </DashboardLayout>
  );
}
