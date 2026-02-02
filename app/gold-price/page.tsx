'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, useToast, LoadingSpinner } from '@/components/ui';
import { GoldPrice } from '@/types';
import { formatGoldPrice } from '@/lib/utils/goldPriceManager';
import GoldPriceChart from '@/components/charts/GoldPriceChart';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

export default function GoldPricePage(props?: { noLayout?: boolean }) {
  const noLayout = props?.noLayout;
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPrice, setNewPrice] = useState('');
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadGoldPrice();
  }, []);

  const loadGoldPrice = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gold-price');
      if (res.ok) {
        const data = await res.json();
        setGoldPrice({
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          lastUpdate: data.lastUpdate,
          trend: data.trend,
          yearlyHighest: data.yearlyHighest,
          yearlyHighestDate: data.yearlyHighestDate,
          history: data.history || [],
        });
      }
    } catch (error) {
      showToast('خطا در دریافت قیمت طلا', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(Number(newPrice))) {
      showToast('لطفاً قیمت معتبر وارد کنید', 'warning');
      return;
    }

    try {
      const currentPrice = goldPrice?.price || 0;
      const price = Number(newPrice);
      const change = price - currentPrice;
      const changePercent = (change / currentPrice) * 100;

      const res = await fetch('/api/gold-price/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, change, changePercent }),
      });

      if (res.ok) {
        showToast('قیمت طلا با موفقیت به‌روزرسانی شد', 'success');
        setNewPrice('');
        loadGoldPrice();
      } else {
        const error = await res.json();
        showToast(error.message || 'خطا در به‌روزرسانی', 'error');
      }
    } catch (error) {
      showToast('خطا در به‌روزرسانی قیمت', 'error');
    }
  };

  const loadingBlock = (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
  if (loading) {
    return noLayout ? loadingBlock : <DashboardLayout title="مدیریت قیمت طلا">{loadingBlock}</DashboardLayout>;
  }

  const mainContent = (
    <div className="space-y-6">
        {/* Current Price Card */}
        {goldPrice && (
          <Card className="bg-linear-to-br from-yellow-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
                قیمت فعلی طلا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">قیمت فعلی</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {formatGoldPrice(goldPrice.price)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">تومان</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تغییرات</p>
                  <p className={`text-2xl font-bold ${
                    goldPrice.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {goldPrice.change >= 0 ? '+' : ''}{goldPrice.change.toLocaleString('fa-IR')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ({goldPrice.changePercent >= 0 ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">بیشترین قیمت سال</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatGoldPrice(goldPrice.yearlyHighest)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">تومان</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Update Price Form */}
        <Card>
          <CardHeader>
            <CardTitle>به‌روزرسانی قیمت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="قیمت جدید (تومان)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUpdatePrice}>
                به‌روزرسانی
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        {goldPrice && (
          <Card>
            <CardHeader>
              <CardTitle>نمودار قیمت طلا</CardTitle>
            </CardHeader>
            <CardContent>
              <GoldPriceChart goldPrice={goldPrice} />
            </CardContent>
          </Card>
        )}
      </div>
  );
  return noLayout ? (
    <>
      {mainContent}
      <ToastContainer />
    </>
  ) : (
    <DashboardLayout title="مدیریت قیمت طلا">
      {mainContent}
      <ToastContainer />
    </DashboardLayout>
  );
}
