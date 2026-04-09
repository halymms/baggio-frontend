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

const makePieTooltip = (total: number) => {
    function PieTooltip({ active, payload }: any) {
        if (!active || !payload?.length) return null;
        const { name, value } = payload[0];
        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
        return (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                <p style={{ margin: 0, color: '#1e3a5f', fontWeight: 500 }}>{name}</p>
                <p style={{ margin: 0, color: '#475569' }}>{`${value} (${pct}%)`}</p>
            </div>
        );
    }
    return PieTooltip;
};

const now = new Date();

export function ActiveContracts({ options }: { options: Options }) {
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<Record<string, unknown>>();
    const [totalActive, setTotalActive] = useState<number | null>(null);
    const [terminatedCount, setTerminatedCount] = useState<number | null>(null);

    const { rentalContractReportList, activeContractCount, terminatedContractReport } = usePropertyApi();

    useEffect(() => {
        activeContractCount().then(setTotalActive);
    }, []);

    useEffect(() => {
        setData(undefined);
        setTerminatedCount(null);
        Promise.all([
            rentalContractReportList(month, year),
            terminatedContractReport(month, year),
        ]).then(([reportData, terminatedData]) => {
            setData(reportData);
            setTerminatedCount(Array.isArray(terminatedData.data) ? terminatedData.data.length : 0);
        });
    }, [month, year]);

    const typeLabels = buildLookup(options, 'type');
    const guaranteeLabels = buildLookup(options, 'guarantee');
    const pcfLabels = buildLookup(options, 'pcf');

    return (
        <div className={styles.chartsGrid}>
            <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>
                    <span className={styles.summaryLabel}>TOTAL DE CONTRATOS ATIVOS</span>
                    {totalActive !== null
                        ? totalActive
                        : <span className={styles.skeletonBlock} style={{ display: 'inline-block', width: 60, height: 28, borderRadius: 6, verticalAlign: 'middle' }} />
                    }
                </p>
                <div className={styles.summaryIcon}>
                    <BuildingOfficeIcon width={32} height={32} color="#2563eb" />
                </div>
            </div>
            <Filters monthVal={month} yearVal={year} onMonth={setMonth} onYear={setYear} />
            {!data ? (
                <>
                    {[...Array(6)].map((_, i) => (
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
                    {(() => {
                        const activeCount = Array.isArray((data as any).data) ? (data as any).data.length : 0;
                        const terminated = terminatedCount ?? 0;
                        const total = activeCount + terminated;
                        const activePct = total > 0 ? ((activeCount / total) * 100).toFixed(1) : '0.0';
                        const terminatedPct = total > 0 ? ((terminated / total) * 100).toFixed(1) : '0.0';
                        const comparisonData = [
                            { name: 'Ativos', value: activeCount },
                            { name: 'Rescindidos', value: terminated },
                        ];
                        const COLORS_COMPARISON = ['#2563eb', '#ef4444'];
                        return (
                            <div className={styles.chartCard}>
                                <div className={styles.chartHeader}>
                                    <p className={styles.chartTitle}>Carteira</p>
                                    <span className={styles.chartTotal}>{total}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 8 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: 13, color: '#6a7282', textTransform: 'uppercase', fontWeight: 500 }}>Ativos</p>
                                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#2563eb', lineHeight: 1.2 }}>{activeCount}</p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#2563eb' }}>{activePct}%</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ margin: 0, fontSize: 13, color: '#6a7282', textTransform: 'uppercase', fontWeight: 500 }}>Rescindidos</p>
                                        <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{terminated}</p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#ef4444' }}>{terminatedPct}%</p>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={comparisonData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={renderPieLabel}
                                        >
                                            {comparisonData.map((_, index) => (
                                                <Cell key={index} fill={COLORS_COMPARISON[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={makePieTooltip(total)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Tipo de Imóvel</p>
                            <span className={styles.chartTotal}>{sumValues(data.contractType as Record<string, number>)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(data?.contractType as Record<string, number>).map(([key, value]) => ({
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
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <p className={styles.chartTitle}>Novos contratos por mês (últimos 6 meses)</p>
                            <span className={styles.chartTotal}>
                                {(data.lastMonths as { month: string; contractsAmount: number }[])
                                    .reduce((sum, m) => sum + m.contractsAmount, 0)}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.lastMonths as { month: string; contractsAmount: number }[]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="contractsAmount"
                                    name="Contratos"
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
