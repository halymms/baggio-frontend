import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { formatBRL } from '@/lib/financial/format';
import styles from '@/app/dashboard/financial/financial.module.scss';

export interface KpiCardsProps {
  receitaBruta: number | null;
  totalDespesas: number | null;
  retirada: number | null;
  porcentagemRetirada: number | null;
  /** Locação: exibe valor quando !== null; Vendas: exibe quando truthy */
  totalDespesasTruthyCheck?: boolean;
}

export function KpiCards({
  receitaBruta,
  totalDespesas,
  retirada,
  porcentagemRetirada,
  totalDespesasTruthyCheck = false,
}: KpiCardsProps) {
  const totalDespesasDisplay = totalDespesasTruthyCheck
    ? totalDespesas
      ? formatBRL(totalDespesas)
      : '---'
    : totalDespesas !== null
      ? formatBRL(totalDespesas)
      : '---';

  return (
    <div className={styles.mainInfoContainer}>
      <div className={`${styles.mainInfoBox} ${styles.infoReceitaLiquida}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>RECEITA BRUTA</span>
          <br />
          {receitaBruta !== null ? formatBRL(receitaBruta) : '---'}
        </p>
        <div className={styles.infoIcon}>
          <ArrowTrendingUpIcon height={32} width={32} color="#00a63e" />
        </div>
      </div>
      <div className={`${styles.mainInfoBox} ${styles.infoTotalDespesas}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>TOTAL DESPESAS</span>
          <br />
          {totalDespesasDisplay}
        </p>
        <div className={styles.infoIcon}>
          <ArrowTrendingDownIcon height={32} width={32} color="#e7000b" />
        </div>
      </div>
      <div className={`${styles.mainInfoBox} ${styles.infoRetirada}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>RETIRADA</span>
          <br />
          {retirada !== null ? formatBRL(retirada) : '---'}
        </p>
        <div className={styles.infoIcon}>
          <CurrencyDollarIcon height={32} width={32} color="#155dfc" />
        </div>
      </div>
      <div className={`${styles.mainInfoBox} ${styles.infoRetirada}`}>
        <p className={styles.infoValue}>
          <span className={styles.infoLabel}>% RETIRADA</span>
          <br />
          {porcentagemRetirada !== null ? porcentagemRetirada.toFixed(2) : '---'}%
        </p>
        <div className={styles.infoIcon}>
          <ReceiptPercentIcon height={32} width={32} color="#155dfc" />
        </div>
      </div>
    </div>
  );
}
