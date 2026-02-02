'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, LoadingSpinner, EmptyState } from '@/components/ui';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderId: string;
  issuedAt: string;
  totalAmount: number;
  status: string;
  order?: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    status: string;
    paymentStatus: string;
  };
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/invoices', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setTotal(data.total ?? 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">فاکتورها</h1>
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="هیچ فاکتوری یافت نشد" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="p-3 text-sm font-semibold">شماره فاکتور</th>
                    <th className="p-3 text-sm font-semibold">شماره سفارش</th>
                    <th className="p-3 text-sm font-semibold">خریدار</th>
                    <th className="p-3 text-sm font-semibold">تاریخ</th>
                    <th className="p-3 text-sm font-semibold">مبلغ</th>
                    <th className="p-3 text-sm font-semibold">وضعیت</th>
                    <th className="p-3 text-sm font-semibold">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{inv.invoiceNumber}</td>
                      <td className="p-3">{inv.order?.orderNumber ?? '-'}</td>
                      <td className="p-3">{inv.order?.customerName ?? '-'}</td>
                      <td className="p-3">{new Date(inv.issuedAt).toLocaleDateString('fa-IR')}</td>
                      <td className="p-3">{inv.totalAmount.toLocaleString('fa-IR')} تومان</td>
                      <td className="p-3">{inv.status === 'issued' ? 'صادر شده' : inv.status}</td>
                      <td className="p-3">
                        <Link href={`/admin/invoices/${inv.orderId}/print`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">چاپ</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      {total > 0 && (
        <p className="text-sm text-gray-600">مجموع: {total} فاکتور</p>
      )}
    </div>
  );
}
