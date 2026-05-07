'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { COLORS_TYPE, Options } from "./_shared";

type MonthData = { month: string; contractsAmount: number };
type PurposeData = Record<string, { amount: number; value: number }>;
type AdvertisedData = { lastMonths: MonthData[]; purposes: PurposeData };

const PURPOSE_LABELS: Record<string, string> = {
    TOTAL: 'Total',
    RESIDENCE: 'Residencial',
    COMMERCIAL: 'Comercial',
    INDUSTRIAL: 'Industrial',
    SEASONAL: 'Temporada',
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

function PurposeTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <p style={{ margin: 0, color: '#1e3a5f', fontWeight: 500 }}>{label}</p>
            <p style={{ margin: 0, color: '#475569' }}>Quantidade: {item.count}</p>
            <p style={{ margin: 0, color: '#475569' }}>Valor: {brl.format(item.value)}</p>
        </div>
    );
}

export function AdvertisedProperties({ options }: { options: Options }) {
    const [data, setData] = useState<AdvertisedData | null>(null);

    const { advertisedPropertyReport } = usePropertyApi();

    useEffect(() => {
        advertisedPropertyReport().then(setData);
    }, []);

    const purposeChartData = data
        ? [
            { name: PURPOSE_LABELS.TOTAL, count: data.purposes.TOTAL?.amount ?? 0, value: data.purposes.TOTAL?.value ?? 0 },
            ...Object.entries(data.purposes)
                .filter(([key]) => key !== 'TOTAL')
                .map(([key, v]) => ({ name: PURPOSE_LABELS[key] ?? key, count: v.amount, value: v.value }))
                .sort((a, b) => b.count - a.count),
        ]
        : [];

    return (
        <div className={styles.chartsGrid}>
            {!data ? (
                <>
                    <div className={`${styles.skeletonCard} ${styles.chartCardLeft}`}>
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
                        <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                    </div>
                </>
            ) : (
                <>
                    <div className={`${styles.chartCard} ${styles.chartCardLeft}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Divulgado no mês</p>
                            <span className={styles.chartTotal}>
                                {data.purposes.TOTAL?.amount ?? 0} · {brl.format(data.purposes.TOTAL?.value ?? 0)}
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
                                        formatter={(v: any) => brlCompact.format(Number(v) || 0)}
                                        style={{ fontSize: 11, fill: '#1e3a5f' }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Imóveis divulgados por mês (últimos 6 meses)</p>
                            <span className={styles.chartTotal}>
                                {data.lastMonths.reduce((sum, m) => sum + m.contractsAmount, 0)}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.lastMonths}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="contractsAmount"
                                    name="Divulgados"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ fill: '#1e3a5f', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
