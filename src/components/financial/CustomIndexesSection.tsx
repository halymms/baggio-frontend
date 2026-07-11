'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useCustomIndexes } from '@/hooks/useCustomIndexes';
import { formatBRL } from '@/lib/financial/format';
import type { FinancialSection } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface CustomIndexesSectionProps {
  section: FinancialSection;
  queryMonth: number;
  queryYear: number;
}

export function CustomIndexesSection({
  section,
  queryMonth,
  queryYear,
}: CustomIndexesSectionProps) {
  const {
    customIndexes,
    customInput,
    setCustomInput,
    customValues,
    customLoading,
    handleAddCustomIndex,
    handleRemoveCustomIndex,
  } = useCustomIndexes(section, queryMonth, queryYear);

  return (
    <div className={styles.customInfoSection}>
      <h4 className={styles.customInfoSectionTitle}>
        <InformationCircleIcon width={20} height={20} /> Informações Destaques
      </h4>
      <div className={styles.customInfoSectionAddContent}>
        <input
          type="text"
          value={customInput}
          className={styles.customInfoSectionInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Digite o índice"
          disabled={customIndexes.length >= 5}
        />
        <button
          type="button"
          onClick={handleAddCustomIndex}
          className={styles.customInfoSectionAddButton}
          disabled={!customInput.trim() || customIndexes.length >= 5}
        >
          Adicionar
        </button>
        <span className={styles.customInfoSectionCount}>
          ({customIndexes.length}/5)
        </span>
      </div>
      <div className={styles.customInfoSectionCountContent}>
        {customIndexes.map((idx, i) => (
          <span className={styles.customInfoSectionIndex} key={i}>
            {idx}
            <button
              type="button"
              onClick={() => handleRemoveCustomIndex(i)}
              className={styles.customInfoSectionRemoveButton}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {customLoading && <div>Carregando...</div>}
      {!customLoading && customIndexes.length === 5 && (
        <div className={styles.customInfoSectionValuesContainer}>
          {customValues.map((v, idx) => (
            <div className={styles.customInfoSectionValuesContent} key={idx}>
              <div className={styles.customInfoSectionValuesResult}>
                {v.amount !== null ? formatBRL(v.amount) : '---'}
              </div>
              <div className={styles.customInfoSectionValuesTitle}>
                {v.service || `Índice ${customIndexes[idx]}`}
              </div>
            </div>
          ))}
        </div>
      )}
      {customIndexes.length !== 5 && (
        <div className={styles.customInfoSectionAddMessage}>
          Adicione 5 índices para exibir as informações.
        </div>
      )}
    </div>
  );
}
