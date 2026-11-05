'use client';

import { useEffect, useState } from 'react';
import { getCashFlow, getCashFlowPeriodos } from '@/services/api';
import type { CashFlowPeriodoDisponivel, CashFlowResponse } from '@/types/properfy';

export function useCashFlow(mes: number, ano: number) {
  const [data, setData] = useState<CashFlowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getCashFlow(mes, ano)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError('Não foi possível carregar o fluxo de caixa.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mes, ano]);

  return { data, loading, error };
}

export function useCashFlowPeriodos() {
  const [periodos, setPeriodos] = useState<CashFlowPeriodoDisponivel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCashFlowPeriodos()
      .then((res) => {
        if (!cancelled) setPeriodos(res.periodos);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar os períodos disponíveis.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { periodos, error };
}
