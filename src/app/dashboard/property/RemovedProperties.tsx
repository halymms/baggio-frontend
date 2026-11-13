'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_TERMINATION, COLORS_TYPE, Filters, Options, PURPOSE_LABELS, PurposeTooltip, sumValues, WrappedTick } from "./_shared";

type Timeseries = { lastMonths: { month: string; count: number; value: number }[] };

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

const REMOVAL_REASON_FALLBACK: Record<string, string> = {
    TOO_LONG_TO_RENT: 'Tempo Excessivo sem Locar',
    DUPLICATED: 'Duplicado',
    NO_EXC_SOLD_COMPANY: 'Sem Exclusividade | Outra Imobiliária Vendeu',
    DIRECT_SELLING: 'Venda Direta',
    SOLD_INTERNALLY: 'Vendido Internamente',
    WITHDRAWAL: 'Desistência',
    PART_OF_PAYMENT: 'Dação em Pagamento',
    SOLD_INT_PARTNER: 'Vendido por Parceiro Interno',
    SOLD_EXT_PARTNER: 'Vendido por Parceiro Externo',
    RENT: 'Locação',
    NO_EXC_SOLD_DIRECT: 'Sem Exclusividade | Venda Direta',
    CHANGED_COMPANY: 'Mudou de Imobiliária',
    OTHER: 'Outros',
};

const now = new Date();

export function RemovedProperties({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();
    const [timeseries, setTimeseries] = useState<Timeseries | null>(null);

    const { removedPropertyReport, removedTimeseries } = usePropertyApi();

    useEffect(() => {
        setData(undefined);
        setTimeseries(null);

        let cancelled = false;
        removedPropertyReport(month, year).then(d => { if (!cancelled) setData(d); });
        removedTimeseries(month, year).then(t => { if (!cancelled) setTimeseries(t); });
        return () => { cancelled = true; };
    }, [month, year]);

    const acquisitionTypeLabels = buildLookup(options, 'acquisitionTypes');
    const terminationReasonLabels = buildLookup(options, 'terminationReason');
    const typeLabels = buildLookup(options, 'type');

    const purposes = (data?.purposes ?? {}) as Record<string, { amount: number; value: number }>;
    const purposeChartData = data
        ? [
            { name: 'Total', count: purposes.TOTAL?.amount ?? 0, value: purposes.TOTAL?.value ?? 0 },
            ...Object.entries(purposes)
                .filter(([key]) => key !== 'TOTAL')
                .map(([key, v]) => ({ name: typeLabels[key] ?? PURPOSE_LABELS[key] ?? key, count: v.amount, value: v.value }))
                .sort((a, b) => b.count - a.count),
        ]
        : [];

    return (
        <div className={styles.chartsGrid}>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {!data ? (
                <>
                    <div className={styles.skeletonCard}>
                        <div className={styles.skeletonHeader}>
                            <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                            <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                        </div>
                        <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                    </div>
                    <div className={styles.skeletonCard}>
                        <div className={styles.skeletonHeader}>
                            <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                            <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                        </div>
                        <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                    </div>
                    <div className={`${styles.skeletonCard} ${styles.chartCardFull}`}>
                        <div className={styles.skeletonHeader}>
                            <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                            <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                        </div>
                        <div className={styles.skeletonBlock} style={{ width: '100%', height: 400, borderRadius: 8 }} />
                    </div>
                    <div className={`${styles.skeletonCard} ${styles.chartCardFull}`}>
                        <div className={styles.skeletonHeader}>
                            <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                            <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                        </div>
                        <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Baixados no mês</p>
                            <span className={styles.chartTotal}>
                                {purposes.TOTAL?.amount ?? 0} · {brl.format(purposes.TOTAL?.value ?? 0)}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={purposeChartData} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip content={<PurposeTooltip />} />
                                <Bar dataKey="count" name="Imóveis" radius={[4, 4, 0, 0]}>
                                    {purposeChartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        formatter={(v: React.ReactNode) => brlCompact.format(Number(v) || 0)}
                                        style={{ fontSize: 11, fill: '#1e3a5f' }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Status</p>
                            <span className={styles.chartTotal}>{sumValues(data.status as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries((data.status ?? {}) as Record<string, number>).map(([key, value]) => ({
                                        name: acquisitionTypeLabels[key] ?? key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {Object.entries((data.status ?? {}) as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Motivo da Baixa</p>
                            <span className={styles.chartTotal}>{sumValues(data.terminationReasons as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={Object.entries((data.terminationReasons ?? {}) as Record<string, number>)
                                    .map(([key, value]) => ({
                                        name: terminationReasonLabels[key] ?? REMOVAL_REASON_FALLBACK[key] ?? key,
                                        value,
                                    }))
                                    .sort((a, b) => b.value - a.value)}
                                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" interval={0} tick={<WrappedTick />} height={80} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Imóveis" radius={[4, 4, 0, 0]}>
                                    {Object.entries((data.terminationReasons ?? {}) as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_TERMINATION[index % COLORS_TERMINATION.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Imóveis baixados por mês (últimos 6 meses)</p>
                            <span className={styles.chartTotal}>
                                {timeseries
                                    ? `${timeseries.lastMonths.reduce((s, m) => s + m.count, 0)} · ${brl.format(timeseries.lastMonths.reduce((s, m) => s + (m.value ?? 0), 0))}`
                                    : ''}
                            </span>
                        </div>
                        {timeseries === null ? (
                            <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timeseries.lastMonths} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" allowDecimals={false} />
                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => brlCompact.format(v)} />
                                    <Tooltip formatter={(value: number, name: string) =>
                                        name === 'Valor' ? brl.format(value) : value
                                    } />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="count"
                                        name="Quantidade"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ fill: '#1e3a5f', r: 4 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="value"
                                        name="Valor"
                                        stroke="#ff6b35"
                                        strokeWidth={2}
                                        dot={{ fill: '#1e3a5f', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
