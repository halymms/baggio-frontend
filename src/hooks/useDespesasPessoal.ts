import { useMemo } from 'react';
import { calcDespesasPessoal } from '@/lib/financial/despesasPessoalCalc';
import type { FinancialSection, RealtimeReportResponse } from '@/types/properfy';

const EMPTY_RESULT = {
  folhaPagamento: 0,
  outrasDespesasPessoal: 0,
  proLabore: 0,
  salarios: 0,
  gratificacoesPremiacoes: 0,
  totalDespesasPessoalExtras: 0,
  totalDespesasPessoal: 0,
  comissaoFolha: 0,
  folhaPagamentoFinal: 0,
};

export function useDespesasPessoal(
  apiData: RealtimeReportResponse | null,
  section: FinancialSection = 1
) {
  return useMemo(() => {
    if (!apiData?.original) {
      return EMPTY_RESULT;
    }
    return calcDespesasPessoal(apiData.original, section);
  }, [apiData, section]);
}
