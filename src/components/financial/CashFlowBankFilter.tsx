'use client';

import { useEffect, useRef } from 'react';
import type { CashFlowBanco } from '@/types/properfy';
import styles from '@/app/dashboard/financial/financial.module.scss';

interface CashFlowBankFilterProps {
  bancos: CashFlowBanco[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function CashFlowBankFilter({
  bancos,
  selectedIds,
  onChange,
}: CashFlowBankFilterProps) {
  const allSelected = bancos.length > 0 && selectedIds.length === bancos.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const todosRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todosRef.current) {
      todosRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    onChange(allSelected ? [] : bancos.map((banco) => banco.fkWallet));
  };

  const toggleOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selected) => selected !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  return (
    <aside className={styles.cashFlowBankPanel} aria-label="Bancos do fluxo de caixa">
      <h2 className={styles.cashFlowBankTitle}>Bancos</h2>
      <label className={`${styles.cashFlowBankRow} ${allSelected ? styles.cashFlowBankRowActive : ''}`}>
        <input
          ref={todosRef}
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
        />
        <span>Todos</span>
      </label>
      <ul className={styles.cashFlowBankList}>
        {bancos.map((banco) => {
          const checked = selectedIds.includes(banco.fkWallet);
          return (
            <li key={banco.fkWallet}>
              <label className={`${styles.cashFlowBankRow} ${checked ? styles.cashFlowBankRowActive : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOne(banco.fkWallet)}
                />
                <span>{banco.nome}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
