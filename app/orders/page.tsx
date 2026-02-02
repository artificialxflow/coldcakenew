'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, Button, useToast } from '@/components/ui';
import { Order } from '@/types';
import { formatPriceWithCurrency } from '@/lib/utils/price';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function OrdersPage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const { showToast, ToastContainer } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentStatusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('admin', 'true');
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/store/orders?${params.toString()}`);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const updateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (res.ok) {
        showToast('وضعیت سفارش به‌روزرسانی شد', 'success');
        loadOrders();
      } else {
        showToast('خطا در به‌روزرسانی', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی', 'error');
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

  const content = (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>فیلترها</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="processing">در حال پردازش</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="">همه وضعیت‌های پرداخت</option>
                <option value="pending">در انتظار</option>
                <option value="paid">پرداخت شده</option>
                <option value="failed">ناموفق</option>
              </select>
              <Button type="submit">جستجو</Button>
            </form>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>لیست سفارش‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500 py-12">سفارشی یافت نشد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-4">شماره سفارش</th>
                      <th className="text-right p-4">مشتری</th>
                      <th className="text-right p-4">مبلغ</th>
                      <th className="text-right p-4">وضعیت</th>
                      <th className="text-right p-4">پرداخت</th>
                      <th className="text-right p-4">تاریخ</th>
                      <th className="text-right p-4">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <Link href={`/orders/${order.id}`} className="text-yellow-600 hover:underline">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="p-4">{order.customerName}</td>
                        <td className="p-4 font-semibold">{formatPriceWithCurrency(order.totalAmount)}</td>
                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`border rounded px-2 py-1 text-sm ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">در انتظار</option>
                            <option value="processing">در حال پردازش</option>
                            <option value="completed">تکمیل شده</option>
                            <option value="cancelled">لغو شده</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'پرداخت شده' :
                             order.paymentStatus === 'failed' ? 'ناموفق' :
                             'در انتظار'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-4">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">مشاهده</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </>
  );
  if (noLayout) return content;
  return <DashboardLayout title="مدیریت سفارش‌ها">{content}</DashboardLayout>;
}
