import { useEffect, useState } from 'react';
import { realtimeReportData } from '@/services/api';
import { getAmountWithService } from '@/lib/financial/amounts';
import { buildRealtimeReportBody } from '@/lib/financial/reportBody';
import type { FinancialSection } from '@/types/properfy';

export type CustomIndexValue = {
  amount: number | null;
  service: string | null;
};

const EMPTY_CUSTOM_VALUES: CustomIndexValue[] = [
  { amount: null, service: null },
  { amount: null, service: null },
  { amount: null, service: null },
  { amount: null, service: null },
  { amount: null, service: null },
];

export function useCustomIndexes(
  section: FinancialSection,
  queryMonth: number,
  queryYear: number
) {
  const [customIndexes, setCustomIndexes] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customValues, setCustomValues] =
    useState<CustomIndexValue[]>(EMPTY_CUSTOM_VALUES);
  const [customLoading, setCustomLoading] = useState(false);

  const handleCustomIndexChange = (idx: number, value: string) => {
    const newIndexes = [...customIndexes];
    newIndexes[idx] = value;
    setCustomIndexes(newIndexes);
  };

  const handleAddCustomIndex = () => {
    const val = customInput.trim();
    if (val && customIndexes.length < 5 && !customIndexes.includes(val)) {
      setCustomIndexes([...customIndexes, val]);
      setCustomInput('');
    }
  };

  const handleRemoveCustomIndex = (idx: number) => {
    setCustomIndexes(customIndexes.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (customIndexes.length !== 5) {
      setCustomValues(EMPTY_CUSTOM_VALUES);
      return;
    }
    setCustomLoading(true);
    const body = buildRealtimeReportBody(section, queryYear, queryMonth);
    realtimeReportData(body)
      .then((res) => {
        const original = res.original ?? [];
        const values = customIndexes.map((idx) =>
          getAmountWithService(original, idx)
        );
        setCustomValues(values);
        setCustomLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching custom indices:', err);
        setCustomValues(EMPTY_CUSTOM_VALUES);
        setCustomLoading(false);
      });
  }, [customIndexes, queryMonth, queryYear, section]);

  return {
    customIndexes,
    customInput,
    setCustomInput,
    customValues,
    customLoading,
    handleCustomIndexChange,
    handleAddCustomIndex,
    handleRemoveCustomIndex,
  };
}
