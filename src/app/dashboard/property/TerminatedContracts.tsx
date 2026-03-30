'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_GUARANTEE, COLORS_TERMINATION, Filters, Options, sumValues } from "./_shared";

const now = new Date();

export function TerminatedContracts({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();

    const { terminatedContractReport } = usePropertyApi();

    useEffect(() => {
        setData(undefined);
        terminatedContractReport(month, year).then(setData);
    }, [month, year]);

    const guaranteeLabels = buildLookup(options, 'guarantee');
    const terminationReasonLabels = buildLookup(options, 'terminationReason');

    return (
        <div className={styles.chartsGrid}>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {data && (
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
                </>
            )}
        </div>
    );
}
