'use client';

import { useEffect, useMemo, useState } from 'react';
import { CashFlowFilters } from '@/components/financial/CashFlowFilters';
import { CashFlowDailyChart } from '@/components/financial/CashFlowDailyChart';
import { CashFlowBankFilter } from '@/components/financial/CashFlowBankFilter';
import { FinancialDataStatus } from '@/components/financial/FinancialDataStatus';
import { useCashFlow, useCashFlowPeriodos } from '@/hooks/useCashFlow';
import { buildBalanceChartData } from '@/lib/financial/cashFlowChart';
import { FINANCIAL_MONTHS } from '@/lib/financial/constants';
import type { CashFlowBanco } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

const currentYear = new Date().getFullYear();
const EMPTY_BANKS: CashFlowBanco[] = [];

export function CashFlowDashboardContent() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedBankIds, setSelectedBankIds] = useState<number[] | null>(null);
  const { periodos, error: periodsError } = useCashFlowPeriodos();

  const availableYears = periodos?.map((periodo) => periodo.ano) ?? [];
  const availableMonths =
    periodos?.find((periodo) => periodo.ano === selectedYear)?.meses ?? [];

  useEffect(() => {
    if (!periodos?.length) return;

    const yearEntry = periodos.find((periodo) => periodo.ano === selectedYear);
    if (!yearEntry) {
      const latest = periodos[periodos.length - 1];
      setSelectedYear(latest.ano);
      setSelectedMonth(latest.meses[latest.meses.length - 1] - 1);
      return;
    }

    if (!yearEntry.meses.includes(selectedMonth + 1)) {
      setSelectedMonth(yearEntry.meses[yearEntry.meses.length - 1] - 1);
    }
  }, [periodos, selectedYear, selectedMonth]);

  const apiMes = selectedMonth + 1;
  const { data, loading, error } = useCashFlow(apiMes, selectedYear);

  const monthLabel =
    FINANCIAL_MONTHS.find((m) => m.value === selectedMonth)?.label ?? '';

  const bancos = data?.bancos ?? EMPTY_BANKS;
  const selectedIds = useMemo(
    () => selectedBankIds ?? bancos.map((banco) => banco.fkWallet),
    [selectedBankIds, bancos]
  );

  const chartData = useMemo(() => {
    if (!data) return [];
    return buildBalanceChartData(
      data.bancos,
      selectedIds,
      apiMes,
      selectedYear,
      data.periodo.fim
    );
  }, [data, selectedIds, apiMes, selectedYear]);

  return (
    <div className={styles.financialPageContainer}>
      <header className={styles.financialPageHeader}>
        <h1 className={styles.financialPageTitle}>Financeiro - Fluxo de Caixa</h1>
        <p className={styles.financialPageSubtitle}>
          Saldo diário dos bancos selecionados
        </p>
      </header>

      <div className={styles.financialPageActionContent}>
        <CashFlowFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          months={availableMonths.length ? availableMonths : [apiMes]}
          years={availableYears.length ? availableYears : [selectedYear]}
          disabled={!periodos}
          onMonthChange={setSelectedMonth}
          onYearChange={(year) => {
            setSelectedYear(year);
            const meses = periodos?.find((periodo) => periodo.ano === year)?.meses ?? [];
            if (meses.length && !meses.includes(selectedMonth + 1)) {
              setSelectedMonth(meses[meses.length - 1] - 1);
            }
          }}
        />
      </div>

      <FinancialDataStatus
        loading={loading || (periodos === null && !periodsError)}
        error={periodsError ?? error}
      />

      {!loading && data?.avisos && data.avisos.length > 0 && (
        <div className={styles.cashFlowAvisos}>
          {data.avisos.map((aviso) => (
            <p key={aviso}>{aviso}</p>
          ))}
        </div>
      )}

      {!loading && !error && data && (
        <div className={styles.cashFlowBoard}>
          <CashFlowDailyChart
            data={chartData}
            monthLabel={monthLabel}
            empty={selectedIds.length === 0}
          />
          <CashFlowBankFilter
            bancos={bancos}
            selectedIds={selectedIds}
            onChange={setSelectedBankIds}
          />
        </div>
      )}
    </div>
  );
}
