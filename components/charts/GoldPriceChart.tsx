'use client';

import { useState, useMemo } from 'react';
import { GoldPrice } from '@/types';
import {
  getDailyChartData,
  getWeeklyChartData,
  getMonthlyChartData,
  getYearlyChartData
} from '@/lib/utils/chartDataGenerator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatGoldPrice } from '@/lib/utils/goldPriceManager';
import { Button } from '@/components/ui';

type ChartPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface GoldPriceChartProps {
  goldPrice: GoldPrice | null;
}

export default function GoldPriceChart({ goldPrice }: GoldPriceChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('daily');

  const chartData = useMemo(() => {
    if (!goldPrice?.history || goldPrice.history.length === 0) {
      return [];
    }

    switch (period) {
      case 'daily':
        return getDailyChartData(goldPrice.history);
      case 'weekly':
        return getWeeklyChartData(goldPrice.history);
      case 'monthly':
        return getMonthlyChartData(goldPrice.history);
      case 'yearly':
        return getYearlyChartData(goldPrice.history);
      default:
        return getDailyChartData(goldPrice.history);
    }
  }, [goldPrice, period]);

  if (!goldPrice?.history || goldPrice.history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant={period === 'daily' ? 'primary' : 'outline'}
          onClick={() => setPeriod('daily')}
        >
          روزانه
        </Button>
        <Button
          size="sm"
          variant={period === 'weekly' ? 'primary' : 'outline'}
          onClick={() => setPeriod('weekly')}
        >
          هفتگی
        </Button>
        <Button
          size="sm"
          variant={period === 'monthly' ? 'primary' : 'outline'}
          onClick={() => setPeriod('monthly')}
        >
          ماهانه
        </Button>
        <Button
          size="sm"
          variant={period === 'yearly' ? 'primary' : 'outline'}
          onClick={() => setPeriod('yearly')}
        >
          سالانه
        </Button>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ direction: 'rtl' }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                }
                return value.toLocaleString('fa-IR');
              }}
            />
            <Tooltip
              formatter={(value: number | undefined) => {
                if (value === undefined || value === null) return '-';
                return formatGoldPrice(value);
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                direction: 'rtl',
                textAlign: 'right',
              }}
            />
            <Legend
              wrapperStyle={{ direction: 'rtl', textAlign: 'right' }}
            />
            {period === 'weekly' || period === 'monthly' || period === 'yearly' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="حداکثر قیمت"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="میانگین قیمت"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2}
                name="قیمت طلا"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
