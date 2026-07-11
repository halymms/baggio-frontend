import { useMemo } from 'react';
import { getAmountFromOriginal } from '@/lib/financial/amounts';
import type { RealtimeReportResponse } from '@/types/properfy';

export function useImpostos(apiData: RealtimeReportResponse | null) {
  return useMemo(() => {
    if (!apiData?.original) return 0;
    const original = apiData.original;
    const impostosFederais = getAmountFromOriginal(original, '1.2.4.1');
    const impostosMunicipais = getAmountFromOriginal(original, '1.2.4.2');
    return impostosFederais + impostosMunicipais;
  }, [apiData]);
}
