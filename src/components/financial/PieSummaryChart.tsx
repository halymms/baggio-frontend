'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c'];

type PieLabelProps = {
  x?: number | string;
  y?: number | string;
  cx?: number | string;
  value?: number | string;
  percent?: number;
};

export type PieSummaryChartProps = {
  dados: number[];
  formatBRL: (value: number) => string;
  labels: string[];
};

export function PieSummaryChart({ dados, formatBRL, labels }: PieSummaryChartProps) {
  const pieData = dados.map((value, index) => ({
    value: Math.abs(value ?? 0),
    name: labels[index] ?? `Item ${index + 1}`,
  }));
  const total = pieData.reduce((acc, item) => acc + item.value, 0);
  const chartData = pieData.map((item) => ({
    ...item,
    percent: total ? item.value / total : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          fill="#1e3a5f"
          isAnimationActive={true}
          outerRadius={100}
          label={(props: unknown) => {
            if (!props || typeof props !== 'object') return null;
            const { x, y, cx, value, percent } = props as PieLabelProps;
            if (x == null || y == null || cx == null) return null;
            const xNum = typeof x === 'number' ? x : Number(x);
            const yNum = typeof y === 'number' ? y : Number(y);
            const cxNum = typeof cx === 'number' ? cx : Number(cx);
            if (!Number.isFinite(xNum) || !Number.isFinite(yNum) || !Number.isFinite(cxNum)) return null;
            const v = Number(value ?? 0);
            const p = percent ?? 0;
            return (
              <text
                x={xNum}
                y={yNum}
                fill="#666"
                textAnchor={xNum > cxNum ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
              >
                {`${formatBRL(v)} (${(p * 100).toFixed(2)}%)`}
              </text>
            );
          }}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [formatBRL(value as number), name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
