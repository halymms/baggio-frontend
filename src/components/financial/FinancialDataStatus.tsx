import styles from './financialDataStatus.module.scss';

interface FinancialDataStatusProps {
  loading?: boolean;
  error?: string | null;
}

export function FinancialDataStatus({ loading, error }: FinancialDataStatusProps) {
  if (!loading && !error) return null;

  return (
    <div className={styles.statusWrap} role="status" aria-live="polite">
      {loading && <p className={styles.loading}>Carregando dados financeiros...</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
