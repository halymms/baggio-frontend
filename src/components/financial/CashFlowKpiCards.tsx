import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { formatBRL } from '@/lib/financial/format';
import type { CashFlowCards } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface CashFlowKpiCardsProps {
  cards: CashFlowCards | null;
  loading?: boolean;
}

function formatValue(value: number | null, loading: boolean): string {
  if (loading || value === null) return '---';
  return formatBRL(value);
}

export function CashFlowKpiCards({ cards, loading = false }: CashFlowKpiCardsProps) {
  const totalGeral = cards?.totalGeral ?? null;
  const totalEntradas = cards?.totalEntradas ?? null;
  const totalSaidas = cards?.totalSaidas ?? null;

  const totalGeralClass =
    totalGeral !== null && totalGeral < 0
      ? styles.cashFlowValueNegative
      : styles.cashFlowValuePositive;

  return (
    <div className={styles.cashFlowKpiContainer}>
      <div className={`${styles.mainInfoBox} ${styles.infoReceitaLiquida}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>TOTAL GERAL</span>
          <br />
          <span className={totalGeralClass}>
            {formatValue(totalGeral, loading)}
          </span>
        </p>
        <div className={styles.infoIcon}>
          <CurrencyDollarIcon
            height={32}
            width={32}
            color={totalGeral !== null && totalGeral < 0 ? '#e7000b' : '#00a63e'}
          />
        </div>
      </div>
      <div className={`${styles.mainInfoBox} ${styles.infoReceitaLiquida}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>TOTAL ENTRADAS</span>
          <br />
          <span className={styles.cashFlowValuePositive}>
            {formatValue(totalEntradas, loading)}
          </span>
        </p>
        <div className={styles.infoIcon}>
          <ArrowTrendingUpIcon height={32} width={32} color="#00a63e" />
        </div>
      </div>
      <div className={`${styles.mainInfoBox} ${styles.infoTotalDespesas}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>TOTAL SAÍDAS</span>
          <br />
          <span className={styles.cashFlowValueNegative}>
            {formatValue(totalSaidas, loading)}
          </span>
        </p>
        <div className={styles.infoIcon}>
          <ArrowTrendingDownIcon height={32} width={32} color="#e7000b" />
        </div>
      </div>
    </div>
  );
}
