'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export function AdvertisedProperties({ options }: { options: Options }) {
    const [data, setData] = useState<AdvertisedData | null>(null);

    const { advertisedPropertyReport } = usePropertyApi();

    useEffect(() => {
        advertisedPropertyReport().then(setData);
    }, []);

    const purposeChartData = data
        ? [
            { name: PURPOSE_LABELS.TOTAL, value: data.purposes.TOTAL?.amount ?? 0 },
            ...Object.entries(data.purposes)
                .filter(([key]) => key !== 'TOTAL')
                .map(([key, v]) => ({ name: PURPOSE_LABELS[key] ?? key, value: v.amount }))
                .sort((a, b) => b.value - a.value),
        ]
        : [];

    return (
        <div className={styles.chartsGrid}>
            {!data ? (
                <div className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                        <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                    </div>
                    <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                </div>
            ) : (
                <>
                    <div className={`${styles.chartCard} ${styles.chartCardLeft}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Divulgado no mês</p>
                            <span className={styles.chartTotal}>{data.purposes.TOTAL?.amount ?? 0}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={purposeChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Imóveis" radius={[4, 4, 0, 0]}>
                                    {purposeChartData.map((_, index) => (
                                        <Cell key={index} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                    ))}
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
