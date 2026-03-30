'use client';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { buildLookup, COLORS_GUARANTEE, COLORS_PCF, COLORS_TYPE, Filters, Options, sumValues } from "./_shared";

const renderPieLabel = ({ x, y, cx, percent, value }: any) => (
    <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${value} (${(percent * 100).toFixed(1)}%)`}
    </text>
);

const makePieTooltip = (total: number) => ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <p style={{ margin: 0, color: '#1e3a5f', fontWeight: 500 }}>{name}</p>
            <p style={{ margin: 0, color: '#475569' }}>{`${value} (${pct}%)`}</p>
        </div>
    );
};

const now = new Date();

export function ActiveContracts({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();
    const [totalActive, setTotalActive] = useState<number | null>(null);

    const { rentalContractReportList, activeContractCount } = usePropertyApi();

    useEffect(() => {
        activeContractCount().then(setTotalActive);
    }, []);

    useEffect(() => {
        setData(undefined);
        rentalContractReportList(month, year).then(setData);
    }, [month, year]);

    const typeLabels = buildLookup(options, 'type');
    const guaranteeLabels = buildLookup(options, 'guarantee');
    const pcfLabels = buildLookup(options, 'pcf');

    return (
        <div className={styles.chartsGrid}>
            <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>
                    <span className={styles.summaryLabel}>TOTAL DE CONTRATOS ATIVOS</span>
                    {totalActive !== null ? totalActive : '---'}
                </p>
                <div className={styles.summaryIcon}>
                    <BuildingOfficeIcon width={32} height={32} color="#2563eb" />
                </div>
            </div>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {data && (
                <>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Tipo de Imóvel</p>
                            <span className={styles.chartTotal}>{sumValues(data.contractType as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(data.contractType as Record<string, number>).map(([key, value]) => ({
                                        name: typeLabels[key] ?? key,
                                        value
                                    }))}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={renderPieLabel}
                                >
                                    {Object.entries(data.contractType as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={makePieTooltip(sumValues(data.contractType as Record<string, number>))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
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
                                    label={renderPieLabel}
                                >
                                    {Object.entries(data.guarantees as Record<string, number>).map((_, index) => (
                                        <Cell key={index} fill={COLORS_GUARANTEE[index % COLORS_GUARANTEE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={makePieTooltip(sumValues(data.guarantees as Record<string, number>))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>FCI</p>
                            <span className={styles.chartTotal}>{sumValues(data.pcf as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={Object.entries(data.pcf as Record<string, number>)
                                    .map(([key, value]) => ({ name: pcfLabels[key] ?? key, value }))
                                    .sort((a, b) => b.value - a.value)}
                                margin={{ top: 8, right: 16, left: 0, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="value" name="FCI" radius={[4, 4, 0, 0]}>
                                    {Object.entries(data.pcf as Record<string, number>)
                                        .sort((a, b) => b[1] - a[1])
                                        .map((_, index) => (
                                            <Cell key={index} fill={COLORS_PCF[index % COLORS_PCF.length]} />
                                        ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Reajustes por Mês</p>
                            <span className={styles.chartTotal}>{sumValues(data.readjustments as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={Object.entries(data.readjustments as Record<string, number>)
                                .map(([month, value]) => ({ month, value }))
                                .sort((a, b) => a.month.localeCompare(b.month))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name="Reajustes"
                                    stroke="#ff6b35"
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
