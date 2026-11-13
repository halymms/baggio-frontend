import type { CashFlowBanco } from '@/types/properfy';

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

export function buildBalanceChartData(
  bancos: CashFlowBanco[],
  selectedIds: number[],
  mes: number,
  ano: number,
  periodoFim?: string
): CashFlowChartDatum[] {
  const lastDay = getLastChartDay(mes, ano, periodoFim);
  const selected = new Set(selectedIds);

  return Array.from({ length: lastDay }, (_, i) => {
    const dia = i + 1;
    const valor = bancos.reduce((sum, banco) => {
      if (!selected.has(banco.fkWallet)) return sum;
      const ponto = banco.dias.find((d) => d.dia === dia);
      return sum + (ponto?.saldo ?? 0);
    }, 0);

    return { dia, valor: Math.round(valor * 100) / 100 };
  });
}
