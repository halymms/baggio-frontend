'use client';
import type { TooltipContentProps } from 'recharts';
import styles from './property.module.scss';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type PurposeDatum = { name: string; count: number; value: number };

// Tooltip dos gráficos de barras por finalidade (quantidade + valor)
export function PurposeTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as PurposeDatum;
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <p style={{ margin: 0, color: '#1e3a5f', fontWeight: 500 }}>{label}</p>
            <p style={{ margin: 0, color: '#475569' }}>Quantidade: {item.count}</p>
            <p style={{ margin: 0, color: '#475569' }}>Valor: {brl.format(item.value)}</p>
        </div>
    );
}

export const COLORS_TYPE = ['#2563eb', '#1e3a5f', '#ff6b35', '#0ea5e9', '#f59e0b', '#475569', '#7c3aed', '#94a3b8'];
export const COLORS_GUARANTEE = ['#1e3a5f', '#2563eb', '#0ea5e9', '#0d9488', '#ff6b35', '#f59e0b', '#7c3aed', '#64748b', '#ef4444', '#10b981', '#f97316'];
export const COLORS_PCF = ['#ff6b35', '#1e3a5f'];
export const COLORS_TERMINATION = ['#1e3a5f', '#2563eb', '#ff6b35', '#ef4444', '#f59e0b', '#0d9488', '#7c3aed', '#64748b', '#0ea5e9', '#10b981', '#f97316', '#475569', '#e11d48', '#0284c7', '#d97706', '#16a34a', '#9333ea'];

export const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Finalidade do imóvel (chrPurpose)
export const PURPOSE_LABELS: Record<string, string> = {
    TOTAL: 'Total',
    RESIDENCE: 'Residencial',
    NOT_RESIDENCE: 'Não Residencial',
    COMMERCIAL: 'Comercial',
    INDUSTRIAL: 'Industrial',
    SEASONAL: 'Temporada',
};

const CURRENT_YEAR =new Date().getFullYear();
export const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

const MAX_TICK_LINES = 4;

const DEFAULT_TICK_CHARS = 14;

// Corta palavras maiores que o limite (ex.: códigos sem tradução como NO_EXC_SOLD_DIRECT)
function splitLongWord(word: string, maxChars: number): string[] {
    if (word.length <= maxChars) return [word];
    const parts: string[] = [];
    for (let i = 0; i < word.length; i += maxChars) parts.push(word.slice(i, i + maxChars));
    return parts;
}

function wrapWords(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    let current = '';
    const words = text.split(/\s+/).filter(Boolean).flatMap(w => splitLongWord(w, maxChars));
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars || !current) {
            current = candidate;
        } else {
            lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);

    if (lines.length > MAX_TICK_LINES) {
        const kept = lines.slice(0, MAX_TICK_LINES);
        kept[MAX_TICK_LINES - 1] = `${kept[MAX_TICK_LINES - 1]}…`;
        return kept;
    }
    return lines;
}

// Tick do eixo X que quebra nomes longos em várias linhas, na horizontal
// O limite de caracteres por linha diminui automaticamente quando as colunas ficam estreitas
export function WrappedTick({ x, y, payload, width, visibleTicksCount, maxChars, fontSize = 12 }: {
    x?: number;
    y?: number;
    payload?: { value: string | number };
    width?: number;
    visibleTicksCount?: number;
    maxChars?: number;
    fontSize?: number;
}) {
    let limit = maxChars ?? DEFAULT_TICK_CHARS;
    if (maxChars === undefined && width && visibleTicksCount) {
        const columnWidth = width / visibleTicksCount;
        const fits = Math.floor((columnWidth - 8) / (fontSize * 0.6));
        limit = Math.max(6, Math.min(DEFAULT_TICK_CHARS, fits));
    }
    const lines = wrapWords(String(payload?.value ?? ''), limit);
    return (
        <g transform={`translate(${x ?? 0},${y ?? 0})`}>
            <text textAnchor="middle" fill="#666" fontSize={fontSize}>
                {lines.map((line, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? 12 : fontSize + 2}>{line}</tspan>
                ))}
            </text>
        </g>
    );
}

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
