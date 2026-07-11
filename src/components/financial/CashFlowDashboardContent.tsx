'use client';

import { useMemo, useState } from 'react';
import { CashFlowFilters } from '@/components/financial/CashFlowFilters';
import { CashFlowKpiCards } from '@/components/financial/CashFlowKpiCards';
import { CashFlowDailyChart } from '@/components/financial/CashFlowDailyChart';
import { FinancialDataStatus } from '@/components/financial/FinancialDataStatus';
import { useCashFlow } from '@/hooks/useCashFlow';
import { buildDailyChartData } from '@/lib/financial/cashFlowChart';
import { FINANCIAL_MONTHS } from '@/lib/financial/constants';
import styles from '@/app/dashboard/financial/financial.module.scss';

const currentYear = new Date().getFullYear();

export function CashFlowDashboardContent() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const apiMes = selectedMonth + 1;
  const { data, loading, error } = useCashFlow(apiMes, selectedYear);

  const monthLabel =
    FINANCIAL_MONTHS.find((m) => m.value === selectedMonth)?.label ?? '';

  const chartData = useMemo(() => {
    if (!data) return [];
    return buildDailyChartData(
      data.grafico,
      apiMes,
      selectedYear,
      data.periodo.fim
    );
  }, [data, apiMes, selectedYear]);

  return (
    <div className={styles.financialPageContainer}>
      <header className={styles.financialPageHeader}>
        <h1 className={styles.financialPageTitle}>Financeiro - Fluxo de Caixa</h1>
        <p className={styles.financialPageSubtitle}>
          Visão agregada do fluxo de caixa de todos os bancos
        </p>
      </header>

      <div className={styles.financialPageActionContent}>
        <CashFlowFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <FinancialDataStatus loading={loading} error={error} />

      {!loading && data?.avisos && data.avisos.length > 0 && (
        <div className={styles.cashFlowAvisos}>
          {data.avisos.map((aviso, i) => (
            <p key={i}>{aviso}</p>
          ))}
        </div>
      )}

      <CashFlowKpiCards cards={data?.cards ?? null} loading={loading} />

      {!loading && !error && chartData.length > 0 && (
        <CashFlowDailyChart
          data={chartData}
          monthLabel={monthLabel}
          year={selectedYear}
        />
      )}
    </div>
  );
}
