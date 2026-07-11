import type { ReportIndexItem } from '@/types/properfy';

export function getAmountFromOriginal(
  original: ReportIndexItem[],
  idx: string
): number {
  const found = original.find((item) => item.index === idx);
  return found ? Number(found.amount) : 0;
}

export function getAmountWithService(original: ReportIndexItem[], idx: string) {
  const found = original.find((item) => item.index === idx);
  return {
    amount: found ? Number(found.amount) : null,
    service: found ? found.service || found.name || null : null,
  };
}
