'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_TERMINATION, COLORS_TYPE, Filters, Options, sumValues } from "./_shared";

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
};

const now = new Date();

export function RemovedProperties({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();

    const { removedPropertyReport } = usePropertyApi();

    useEffect(() => {
        setData(undefined);
        removedPropertyReport(month, year).then(setData);
    }, [month, year]);

    const acquisitionTypeLabels = buildLookup(options, 'acquisitionTypes');
    const terminationReasonLabels = buildLookup(options, 'terminationReason');
    const typeLabels = buildLookup(options, 'type');

    const purposes = (data?.purposes ?? {}) as Record<string, number>;
    const purposeChartData = data
        ? [
            { name: 'Total', value: purposes.TOTAL ?? 0 },
            ...Object.entries(purposes)
                .filter(([key]) => key !== 'TOTAL')
                .map(([key, value]) => ({ name: typeLabels[key] ?? key, value }))
                .sort((a, b) => b.value - a.value),
        ]
        : [];

    return (
        <div className={styles.chartsGrid}>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {!data ? (
                <>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonHeader}>
                                <div className={styles.skeletonBlock} style={{ width: '40%', height: 16 }} />
                                <div className={styles.skeletonBlock} style={{ width: 40, height: 24 }} />
                            </div>
                            <div className={styles.skeletonBlock} style={{ width: '100%', height: 300, borderRadius: 8 }} />
                        </div>
                    ))}
                </>
            ) : (
                <>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Baixados no mês</p>
                            <span className={styles.chartTotal}>{purposes.TOTAL ?? 0}</span>
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
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={80} />
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
                </>
            )}
        </div>
    );
}
