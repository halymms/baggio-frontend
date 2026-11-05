import { FINANCIAL_MONTHS } from '@/lib/financial/constants';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface CashFlowFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  months: number[];
  years: number[];
  disabled?: boolean;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function CashFlowFilters({
  selectedMonth,
  selectedYear,
  months = [],
  years = [],
  disabled = false,
  onMonthChange,
  onYearChange,
}: CashFlowFiltersProps) {
  const monthOptions = FINANCIAL_MONTHS.filter((month) => months.includes(month.value + 1));

  return (
    <div className={styles.financialPageFiltersContainer}>
      <div className={styles.financialPageSelectContent}>
        <select
          className={`${styles.financialPageSelect} ${styles.financialPageSelectMonth}`}
          value={selectedMonth}
          disabled={disabled}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.financialPageSelectContent}>
        <select
          className={`${styles.financialPageSelect} ${styles.financialPageSelectYear}`}
          value={selectedYear}
          disabled={disabled}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
