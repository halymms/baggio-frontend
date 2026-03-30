'use client';
import styles from './property.module.scss';

export const COLORS_TYPE = ['#2563eb', '#1e3a5f', '#ff6b35', '#0ea5e9', '#f59e0b', '#475569', '#7c3aed', '#94a3b8'];
export const COLORS_GUARANTEE = ['#1e3a5f', '#2563eb', '#0ea5e9', '#0d9488', '#ff6b35', '#f59e0b', '#7c3aed', '#64748b', '#ef4444', '#10b981', '#f97316'];
export const COLORS_PCF = ['#ff6b35', '#1e3a5f'];
export const COLORS_TERMINATION = ['#1e3a5f', '#2563eb', '#ff6b35', '#ef4444', '#f59e0b', '#0d9488', '#7c3aed', '#64748b', '#0ea5e9', '#10b981', '#f97316', '#475569', '#e11d48', '#0284c7', '#d97706', '#16a34a', '#9333ea'];

export const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CURRENT_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export type OptionItem = { value: string; text: string };
export type Options = Record<string, OptionItem[]>;

export function buildLookup(options: Options, key: string): Record<string, string> {
    const items = options[key] ?? [];
    return Object.fromEntries(items.map(({ value, text }) => [value, text]));
}

export function sumValues(obj: Record<string, number> | null | undefined): number {
    if (!obj) return 0;
    return Object.values(obj).reduce((acc, v) => acc + v, 0);
}

export function Filters({ monthVal, yearVal, onMonth, onYear }: {
    monthVal: number;
    yearVal: number;
    onMonth: (v: number) => void;
    onYear: (v: number) => void;
}) {
    return (
        <div className={styles.filtersActionContent}>
            <div className={styles.filtersContainer}>
                <div className={styles.filterSelectContent}>
                    <select className={styles.filterSelect} value={monthVal} onChange={e => onMonth(Number(e.target.value))}>
                        {MONTHS.map((name, i) => (
                            <option key={i + 1} value={i + 1}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterSelectContent}>
                    <select className={`${styles.filterSelect} ${styles.filterSelectYear}`} value={yearVal} onChange={e => onYear(Number(e.target.value))}>
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
