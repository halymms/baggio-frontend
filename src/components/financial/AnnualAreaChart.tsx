'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export type AnnualChartType = 'bonificacao' | 'taxaAdministracao' | 'taxaIntermediacao';

export type AnnualAreaDatum = { month: string; value: number };

const DEFAULT_TYPE_LABELS: Record<AnnualChartType, { name: string; color: string }> = {
  taxaAdministracao: { name: 'Taxa de Administração', color: '#0088FE' },
  taxaIntermediacao: { name: 'Taxa de Intermediação', color: '#00C49F' },
  bonificacao: { name: 'Bonificação', color: '#FFBB28' },
};

export type AnnualAreaChartProps = {
  dados: AnnualAreaDatum[];
  formatBRL: (value: number) => string;
  selectedAnnualType: AnnualChartType;
  labels?: Partial<Record<AnnualChartType, { name: string; color: string }>>;
};

export function AnnualAreaChart({
  dados,
  formatBRL,
  selectedAnnualType,
  labels,
}: AnnualAreaChartProps) {
  const typeConfig = { ...DEFAULT_TYPE_LABELS, ...labels }[selectedAnnualType];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis tickFormatter={formatBRL} hide />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip formatter={(value: number) => formatBRL(value)} />
        <Area
          type="monotone"
          dataKey="value"
          name={typeConfig.name}
          stroke={typeConfig.color}
          fill={typeConfig.color}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
