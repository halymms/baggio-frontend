import { useMemo } from "react";

export function useInvestimentos(apiData: any) {
  return useMemo(() => {
    if (!apiData) return 0;
    const original = apiData.original || [];
    const getAmount = (idx: string) => {
      const found = original.find((item: any) => item.index === idx);
      return found ? Number(found.amount) : 0;
    };
    return getAmount("1.2.9.4");
  }, [apiData]);
}
