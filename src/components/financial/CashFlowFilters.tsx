import { FINANCIAL_MONTHS, CASH_FLOW_YEARS } from '@/lib/financial/constants';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface CashFlowFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function CashFlowFilters({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: CashFlowFiltersProps) {
  return (
    <div className={styles.financialPageFiltersContainer}>
      <div className={styles.financialPageSelectContent}>
        <select
          className={`${styles.financialPageSelect} ${styles.financialPageSelectMonth}`}
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {FINANCIAL_MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.financialPageSelectContent}>
        <select
          className={`${styles.financialPageSelect} ${styles.financialPageSelectYear}`}
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {CASH_FLOW_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
