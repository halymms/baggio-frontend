'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_GUARANTEE, COLORS_TERMINATION, COLORS_TYPE, Filters, Options, sumValues } from "./_shared";

const now = new Date();

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

type Timeseries = { lastMonths: { month: string; count: number; value: number }[] };

export function TerminatedContracts({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();
    const [timeseries, setTimeseries] = useState<Timeseries | null>(null);

    const { terminatedContractReport, terminatedTimeseries } = usePropertyApi();

    useEffect(() => {
        setData(undefined);
        setTimeseries(null);

        let cancelled = false;
        terminatedContractReport(month, year).then(d => { if (!cancelled) setData(d); });
        terminatedTimeseries(month, year).then(t => { if (!cancelled) setTimeseries(t); });
        return () => { cancelled = true; };
    }, [month, year]);

    const guaranteeLabels = buildLookup(options, 'guarantee');
    const terminationReasonLabels = buildLookup(options, 'terminationReason');
    const typeLabels = buildLookup(options, 'type');

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
                            <p className={styles.chartTitle}>Garantia</p>
                            <span className={styles.chartTotal}>{sumValues(data.guarantees as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(data.guarantees as Record<string, number>).map(([key, value]) => ({
                                        name: guaranteeLabels[key] ?? key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {Object.entries(data.guarantees as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_GUARANTEE[index % COLORS_GUARANTEE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Tipo de Imóvel</p>
                            <span className={styles.chartTotal}>{sumValues(data.contractType as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries((data.contractType ?? {}) as Record<string, number>).map(([key, value]) => ({
                                        name: typeLabels[key] ?? key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {Object.entries((data.contractType ?? {}) as Record<string, number>).map((_, index) => (
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
                            <p className={styles.chartTitle}>Motivo da Rescisão</p>
                            <span className={styles.chartTotal}>{sumValues(data.terminationReasons as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={Object.entries(data.terminationReasons as Record<string, number>)
                                    .map(([key, value]) => ({
                                        name: terminationReasonLabels[key] ?? key,
                                        value
                                    }))
                                    .sort((a, b) => b.value - a.value)}
                                margin={{ top: 8, right: 16, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="Contratos" radius={[4, 4, 0, 0]}>
                                    {Object.entries(data.terminationReasons as Record<string, number>)
                                        .sort((a, b) => b[1] - a[1])
                                        .map((_, index) => (
                                            <Cell key={index} fill={COLORS_TERMINATION[index % COLORS_TERMINATION.length]} />
                                        ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`${styles.chartCard} ${styles.chartCardFull}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Rescisões por mês (últimos 6 meses)</p>
                            <span className={styles.chartTotal}>
                                {timeseries
                                    ? `${timeseries.lastMonths.reduce((s, m) => s + m.count, 0)} · ${brl.format(timeseries.lastMonths.reduce((s, m) => s + m.value, 0))}`
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
