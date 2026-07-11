import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FINANCIAL_MONTHS, FINANCIAL_YEARS } from '@/lib/financial/constants';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface MonthYearFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onSearch: () => void;
}

export function MonthYearFilters({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onSearch,
}: MonthYearFiltersProps) {
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
          {FINANCIAL_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        className={styles.financialPageSearchButton}
        onClick={onSearch}
      >
        <MagnifyingGlassIcon width={20} height={20} />
        Buscar
      </button>
    </div>
  );
}
