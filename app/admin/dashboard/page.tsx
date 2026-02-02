'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from '@/components/ui';
import {
  CurrencyDollarIcon,
  TrophyIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CubeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { formatGoldPrice } from '@/lib/utils/goldPriceManager';
import { Report, GoldPrice } from '@/types';

export default function AdminDashboardPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [reportRes, goldPriceRes] = await Promise.all([
          fetch('/api/reports/summary', { credentials: 'include' }),
          fetch('/api/gold-price', { credentials: 'include' }),
        ]);
        if (reportRes.ok) setReport(await reportRes.json());
        if (goldPriceRes.ok) {
          const d = await goldPriceRes.json();
          setGoldPrice({ price: d.price, change: d.change, changePercent: d.changePercent, lastUpdate: d.lastUpdate, trend: d.trend, yearlyHighest: d.yearlyHighest, yearlyHighestDate: d.yearlyHighestDate });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">خوش آمدید!</h2>
        <p className="text-gray-600">این داشبورد شماست. از اینجا می‌توانید تمام بخش‌های سیستم را مدیریت کنید.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="bg-linear-to-br from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              <span>فروش ماه جاری</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{(report?.monthlySales || 0).toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
        <Card hover className="bg-linear-to-br from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
              <span>بالاترین قیمت طلای سال</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{goldPrice ? formatGoldPrice(goldPrice.yearlyHighest) : '۰'}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
        <Card hover className="bg-linear-to-br from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EnvelopeIcon className="h-6 w-6 text-yellow-600" />
              <span>پیام‌های ارسال شده امروز</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{report?.messagesSentToday || 0}</p>
            <p className="text-sm text-gray-600 mt-2">پیام</p>
          </CardContent>
        </Card>
        <Card hover className="bg-linear-to-br from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BanknotesIcon className="h-6 w-6 text-yellow-600" />
              <span>موجودی سرمایه در گردش</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{(report?.workingCapital || 0).toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="bg-linear-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CubeIcon className="h-6 w-6 text-blue-600" />
              <span>ارزش موجودی</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{(report?.totalInventory || 0).toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
        <Card hover className="bg-linear-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
              <span>مجموع طلب از مشتریان</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{(report?.totalDebts || 0).toLocaleString('fa-IR')}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
        <Card hover className="bg-linear-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-6 w-6 text-purple-600" />
              <span>قیمت طلای فعلی</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{goldPrice ? formatGoldPrice(goldPrice.price) : '۰'}</p>
            <p className="text-sm text-gray-600 mt-2">تومان</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/messages">
          <Card hover className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">پیام‌رسانی</h3>
              <p className="text-sm text-gray-600">ارسال پیام به مشتریان</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card hover className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">مدیریت محصولات</h3>
              <p className="text-sm text-gray-600">افزودن، ویرایش و مدیریت محصولات</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card hover className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">گزارش‌ها</h3>
              <p className="text-sm text-gray-600">مشاهده گزارش‌های مالی</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
