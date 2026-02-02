'use client';

import { Sale, Inventory, Product, Debt } from '@/types';
import { getWorkingCapitalTrendData } from '@/lib/utils/reportChartData';
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

interface WorkingCapitalChartProps {
  sales: Sale[];
  inventory: Inventory[];
  products: Product[];
  debts: Debt[];
}

export default function WorkingCapitalChart({
  sales,
  inventory,
  products,
  debts
}: WorkingCapitalChartProps) {
  const data = getWorkingCapitalTrendData(sales, inventory, products, debts);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
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
        <Line
          type="monotone"
          dataKey="capital"
          stroke="#3b82f6"
          strokeWidth={3}
          name="سرمایه در گردش"
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
