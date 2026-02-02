'use client';

import { Sale } from '@/types';
import { getMonthlySalesChartData, getSalesComparisonChartData } from '@/lib/utils/reportChartData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SalesChartProps {
  sales: Sale[];
  type: 'monthly' | 'comparison';
  currentMonth?: number;
  currentYear?: number;
  previousMonth?: number;
  previousYear?: number;
}

export default function SalesChart({
  sales,
  type,
  currentMonth,
  currentYear,
  previousMonth,
  previousYear
}: SalesChartProps) {
  const data = type === 'monthly'
    ? getMonthlySalesChartData(sales)
    : getSalesComparisonChartData(
        sales,
        currentMonth || new Date().getMonth() + 1,
        currentYear || new Date().getFullYear(),
        previousMonth || new Date().getMonth(),
        previousYear || new Date().getFullYear()
      );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={type === 'monthly' ? 'month' : 'period'}
          stroke="#6b7280"
          style={{ direction: 'rtl' }}
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}K`;
            }
            return value.toString();
          }}
        />
        <Tooltip
          formatter={(value: number | undefined) => {
            if (value === undefined || value === null) return '-';
            return value.toLocaleString('fa-IR') + ' تومان';
          }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            direction: 'rtl',
            textAlign: 'right',
          }}
        />
        <Legend wrapperStyle={{ direction: 'rtl', textAlign: 'right' }} />
        <Bar
          dataKey="sales"
          fill="#f59e0b"
          name="فروش"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
