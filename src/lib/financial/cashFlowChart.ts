import type { CashFlowGraficoDia } from '@/types/properfy';

export interface CashFlowChartDatum {
  dia: number;
  valor: number;
}

function isCurrentMonth(mes: number, ano: number): boolean {
  const now = new Date();
  return ano === now.getFullYear() && mes === now.getMonth() + 1;
}

function getLastChartDay(mes: number, ano: number, periodoFim?: string): number {
  if (isCurrentMonth(mes, ano)) {
    if (periodoFim) {
      return new Date(`${periodoFim}T12:00:00`).getDate();
    }
    return new Date().getDate();
  }
  return new Date(ano, mes, 0).getDate();
}

export function buildDailyChartData(
  grafico: CashFlowGraficoDia[],
  mes: number,
  ano: number,
  periodoFim?: string
): CashFlowChartDatum[] {
  const lastDay = getLastChartDay(mes, ano, periodoFim);
  const byDay = new Map(grafico.map((item) => [item.dia, item.valor]));

  return Array.from({ length: lastDay }, (_, i) => {
    const dia = i + 1;
    return { dia, valor: byDay.get(dia) ?? 0 };
  });
}
