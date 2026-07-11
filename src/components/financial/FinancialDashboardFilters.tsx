import Link from 'next/link';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FinancialDataStatus } from '@/components/financial/FinancialDataStatus';
import { MonthYearFilters } from '@/components/financial/MonthYearFilters';
import type { FinancialSection } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

export interface FinancialDashboardFiltersProps {
  loading: boolean;
  error: string | null;
  selectedMonth: number;
  selectedYear: number;
  section: FinancialSection;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onSearch: () => void;
}

export function FinancialDashboardFilters({
  loading,
  error,
  selectedMonth,
  selectedYear,
  section,
  onMonthChange,
  onYearChange,
  onSearch,
}: FinancialDashboardFiltersProps) {
  return (
    <>
      <FinancialDataStatus loading={loading} error={error} />
      <div className={styles.financialPageActionContent}>
        <MonthYearFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          onSearch={onSearch}
        />
        <Link
          className={styles.financialPageLink}
          href={`/dashboard/financial/reports?month=${selectedMonth}&year=${selectedYear}&section=${section}`}
        >
          <DocumentTextIcon width={24} height={24} /> Fechamento
        </Link>
      </div>
    </>
  );
}
