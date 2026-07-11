import { useMemo } from 'react';
import { getAmountFromOriginal } from '@/lib/financial/amounts';
import type { RealtimeReportResponse } from '@/types/properfy';

export function useInvestimentos(apiData: RealtimeReportResponse | null) {
  return useMemo(() => {
    if (!apiData?.original) return 0;
    return getAmountFromOriginal(apiData.original, '1.2.9.4');
  }, [apiData]);
}
