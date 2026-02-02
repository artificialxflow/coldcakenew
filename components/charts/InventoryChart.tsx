'use client';

import { Inventory, Product } from '@/types';
import { getTopInventoryChartData } from '@/lib/utils/reportChartData';
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

interface InventoryChartProps {
  inventory: Inventory[];
  products: Product[];
}

export default function InventoryChart({
  inventory,
  products
}: InventoryChartProps) {
  const data = getTopInventoryChartData(inventory, products);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
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
        <YAxis
          type="category"
          dataKey="product"
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          width={90}
          style={{ direction: 'rtl' }}
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
          dataKey="value"
          fill="#10b981"
          name="ارزش موجودی"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
