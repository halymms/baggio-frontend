import { useMemo } from "react";

export function useImpostos(apiData: any) {
  return useMemo(() => {
    if (!apiData) return 0;
    const original = apiData.original || [];
    const getAmount = (idx: string) => {
      const found = original.find((item: any) => item.index === idx);
      return found ? Number(found.amount) : 0;
    };
    const impostosFederais = getAmount("1.2.4.1");
    const impostosMunicipais = getAmount("1.2.4.2");
    return impostosFederais + impostosMunicipais;
  }, [apiData]);
}
