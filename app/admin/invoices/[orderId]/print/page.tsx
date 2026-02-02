'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, LoadingSpinner } from '@/components/ui';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  orderId: string;
  issuedAt: string;
  totalAmount: number;
  tax: number | null;
  discount: number | null;
  status: string;
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: unknown;
    items: OrderItem[];
  };
}

export default function InvoicePrintPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/admin/invoices?orderId=${encodeURIComponent(orderId)}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('فاکتور یافت نشد');
        return res.json();
      })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error || 'فاکتور یافت نشد'}</p>
        <Link href="/admin/invoices" className="text-yellow-600 hover:underline mt-4 inline-block">
          بازگشت به لیست فاکتورها
        </Link>
      </div>
    );
  }

  const o = invoice.order;
  const subtotal = o.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const tax = invoice.tax ?? 0;
  const discount = invoice.discount ?? 0;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="no-print flex justify-between items-center mb-6">
        <Link href="/admin/invoices" className="text-yellow-600 hover:underline">
          بازگشت به لیست فاکتورها
        </Link>
        <Button onClick={handlePrint}>چاپ فاکتور</Button>
      </div>

      <div id="invoice-print" className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">فروشگاه کولدکیک</h1>
          <p className="text-sm text-gray-600 mt-1">فاکتور فروش</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">شماره فاکتور</p>
            <p className="font-mono">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">شماره سفارش</p>
            <p>{o.orderNumber}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">تاریخ صدور</p>
            <p>{new Date(invoice.issuedAt).toLocaleDateString('fa-IR')}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">وضعیت پرداخت</p>
            <p>{o.paymentStatus === 'paid' ? 'پرداخت شده' : o.paymentStatus === 'pending' ? 'در انتظار پرداخت' : o.paymentStatus}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="border-t border-gray-200 pt-4">
          <p className="font-semibold text-gray-700 mb-2">مشخصات خریدار</p>
          <p>نام: {o.customerName}</p>
          <p>تلفن: {o.customerPhone}</p>
          {o.customerEmail && <p>ایمیل: {o.customerEmail}</p>}
        </div>

        {/* Items */}
        <div className="border-t border-gray-200 pt-4">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-2 text-sm font-semibold">ردیف</th>
                <th className="p-2 text-sm font-semibold">نام محصول</th>
                <th className="p-2 text-sm font-semibold">تعداد</th>
                <th className="p-2 text-sm font-semibold">قیمت واحد</th>
                <th className="p-2 text-sm font-semibold">جمع</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{item.productName}</td>
                  <td className="p-2">{item.quantity.toLocaleString('fa-IR')}</td>
                  <td className="p-2">{item.unitPrice.toLocaleString('fa-IR')}</td>
                  <td className="p-2">{(item.unitPrice * item.quantity).toLocaleString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-1 text-sm">
          {discount > 0 && (
            <div className="flex justify-between">
              <span>تخفیف</span>
              <span>{discount.toLocaleString('fa-IR')} تومان</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between">
              <span>مالیات</span>
              <span>{tax.toLocaleString('fa-IR')} تومان</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2">
            <span>مبلغ قابل پرداخت</span>
            <span>{invoice.totalAmount.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>
      </div>
    </div>
  );
}
