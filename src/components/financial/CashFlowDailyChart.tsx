'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatBRL } from '@/lib/financial/format';
import type { CashFlowChartDatum } from '@/lib/financial/cashFlowChart';
import styles from '@/app/dashboard/financial/financial.module.scss';

const POSITIVE_COLOR = '#00a63e';
const NEGATIVE_COLOR = '#e7000b';

interface CashFlowDailyChartProps {
  data: CashFlowChartDatum[];
  monthLabel: string;
  year: number;
}

export function CashFlowDailyChart({
  data,
  monthLabel,
  year,
}: CashFlowDailyChartProps) {
  return (
    <div className={styles.cashFlowChartCard}>
      <h2 className={styles.chartTitle}>
        Fluxo de Caixa Diário - {monthLabel} {year}
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => formatBRL(v)} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => formatBRL(value)} labelFormatter={(dia) => `Dia ${dia}`} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="valor" name="Total" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.valor >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
