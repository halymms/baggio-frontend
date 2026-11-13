'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatBRL } from '@/lib/financial/format';
import type { CashFlowChartDatum } from '@/lib/financial/cashFlowChart';
import styles from '@/app/dashboard/financial/financial.module.scss';

const AREA_COLOR = '#8ecdf8';
const LINE_COLOR = '#2b8fd6';

interface CashFlowDailyChartProps {
  data: CashFlowChartDatum[];
  monthLabel: string;
  empty?: boolean;
}

export function CashFlowDailyChart({
  data,
  monthLabel,
  empty = false,
}: CashFlowDailyChartProps) {
  const min = data.reduce((acc, item) => Math.min(acc, item.valor), 0);
  const max = data.reduce((acc, item) => Math.max(acc, item.valor), 0);
  const domainMax = max === 0 && min === 0 ? 1 : max;

  return (
    <div className={styles.cashFlowChartCard}>
      <h2 className={styles.chartTitle}>Saldo do Dia</h2>
      {empty ? (
        <p className={styles.cashFlowEmpty}>Selecione ao menos um banco para ver o saldo.</p>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 28 }}>
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 12, fill: '#475569' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{
                value: monthLabel.toLocaleLowerCase('pt-BR'),
                position: 'insideBottom',
                offset: -18,
                fill: '#1e293b',
                fontSize: 14,
              }}
            />
            <YAxis hide domain={[min, domainMax]} />
            <Tooltip
              formatter={(value: number) => [formatBRL(Number(value)), 'Saldo']}
              labelFormatter={(dia) => `Dia ${dia}`}
            />
            <Area
              type="linear"
              dataKey="valor"
              name="Saldo"
              stroke={LINE_COLOR}
              strokeWidth={2}
              fill={AREA_COLOR}
              fillOpacity={0.95}
              baseValue={0}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
