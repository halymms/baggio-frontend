'use client';
import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_GUARANTEE, COLORS_TERMINATION, COLORS_TYPE, Filters, Options, sumValues } from "./_shared";

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

    return (
        <div className={styles.chartsGrid}>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {data && (
                <>
                    <div className={`${styles.chartCard} ${styles.chartCardLeft}`}>
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
                    <div className={`${styles.chartCard} ${styles.chartCardTallRight}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Motivo da Baixa</p>
                            <span className={styles.chartTotal}>{sumValues(data.terminationReasons as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={600}>
                            <PieChart>
                                <Pie
                                    data={Object.entries((data.terminationReasons ?? {}) as Record<string, number>).map(([key, value]) => ({
                                        name: terminationReasonLabels[key] ?? key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {Object.entries((data.terminationReasons ?? {}) as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_TERMINATION[index % COLORS_TERMINATION.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`${styles.chartCard} ${styles.chartCardLeft}`}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Tipo de Angariação</p>
                            <span className={styles.chartTotal}>{sumValues(data.listingTypes as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries((data.listingTypes ?? {}) as Record<string, number>).map(([key, value]) => ({
                                        name: key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {Object.entries((data.listingTypes ?? {}) as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_GUARANTEE[index % COLORS_GUARANTEE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
