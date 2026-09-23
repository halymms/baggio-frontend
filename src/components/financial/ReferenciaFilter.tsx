import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { InadimplenciaReferencia } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface ReferenciaFilterProps {
  referencias: InadimplenciaReferencia[];
  selectedMes: number | null;
  selectedAno: number | null;
  onChange: (mes: number, ano: number) => void;
  onSearch: () => void;
  disabled?: boolean;
}

function optionValue(mes: number, ano: number) {
  return `${ano}-${mes}`;
}

export function ReferenciaFilter({
  referencias,
  selectedMes,
  selectedAno,
  onChange,
  onSearch,
  disabled = false,
}: ReferenciaFilterProps) {
  const value =
    selectedMes && selectedAno ? optionValue(selectedMes, selectedAno) : '';

  return (
    <div className={styles.financialPageFiltersContainer}>
      <div className={styles.financialPageSelectContent}>
        <select
          className={`${styles.financialPageSelect} ${styles.financialPageSelectReferencia}`}
          value={value}
          disabled={disabled || referencias.length === 0}
          onChange={(event) => {
            const [ano, mes] = event.target.value.split('-').map(Number);
            onChange(mes, ano);
          }}
        >
          {referencias.length === 0 ? (
            <option value="">Nenhuma referência sincronizada</option>
          ) : (
            referencias.map((referencia) => (
              <option
                key={optionValue(referencia.mes, referencia.ano)}
                value={optionValue(referencia.mes, referencia.ano)}
              >
                {referencia.label}
              </option>
            ))
          )}
        </select>
      </div>
      <button
        type="button"
        className={styles.financialPageSearchButton}
        onClick={onSearch}
        disabled={disabled || !selectedMes || !selectedAno}
      >
        <MagnifyingGlassIcon width={20} height={20} />
        Buscar
      </button>
    </div>
  );
}
