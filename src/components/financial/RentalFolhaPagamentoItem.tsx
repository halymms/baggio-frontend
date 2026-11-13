import { formatBRL } from '@/lib/financial/format';
import type { FinancialSection } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface RentalFolhaPagamentoItemProps {
  section: FinancialSection;
  calculoFolhaPagamento: number | null;
}

export function RentalFolhaPagamentoItem({
  section,
  calculoFolhaPagamento,
}: RentalFolhaPagamentoItemProps) {
  if (section !== 1) {
    return null;
  }

  const valorExibido =
    calculoFolhaPagamento !== null
      ? formatBRL(-Math.abs(calculoFolhaPagamento))
      : '---';

  return (
    <div className={styles.despesasPessoalInfoItem}>
      <span className={styles.despesasPessoalInfoLabel}>FOLHA DE PAGAMENTO</span>
      <br />
      {valorExibido}
    </div>
  );
}
