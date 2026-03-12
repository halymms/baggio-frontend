'use client';
import { useEffect, useState } from "react";
import styles from './property.module.scss';
import { usePropertyApi } from "@/services/usePropertyApi";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS_TYPE = ['#2563eb', '#1e3a5f', '#ff6b35', '#0ea5e9', '#f59e0b', '#475569', '#7c3aed', '#94a3b8'];

const COLORS_GUARANTEE = ['#1e3a5f', '#2563eb', '#0ea5e9', '#0d9488', '#ff6b35', '#f59e0b', '#7c3aed', '#64748b', '#ef4444', '#10b981', '#f97316'];

const COLORS_PCF = ['#ff6b35', '#1e3a5f'];

const COLORS_TERMINATION = ['#1e3a5f', '#2563eb', '#ff6b35', '#ef4444', '#f59e0b', '#0d9488', '#7c3aed', '#64748b', '#0ea5e9', '#10b981', '#f97316', '#475569', '#e11d48', '#0284c7', '#d97706', '#16a34a', '#9333ea'];

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

type OptionItem = { value: string; text: string };
type Options = Record<string, OptionItem[]>;

function buildLookup(options: Options, key: string): Record<string, string> {
    const items = options[key] ?? [];
    return Object.fromEntries(items.map(({ value, text }) => [value, text]));
}

function sumValues(obj: Record<string, number>): number {
    return Object.values(obj).reduce((acc, v) => acc + v, 0);
}

type Tab = 'ativos' | 'reajustados' | 'rescindidos';

export default function Page() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [terminatedMonth, setTerminatedMonth] = useState(now.getMonth() + 1);
    const [terminatedYear, setTerminatedYear] = useState(now.getFullYear());

    const [data, setData] = useState<Record<string, unknown>>();
    const [terminatedData, setTerminatedData] = useState<Record<string, unknown>>();
    const [options, setOptions] = useState<Options>({});
    const [activeTab, setActiveTab] = useState<Tab>('ativos');

    const { rentalContractReportList, terminatedContractReport, rentalContractOptions } = usePropertyApi();

    useEffect(() => {
        rentalContractOptions().then(setOptions);
    }, []);

    useEffect(() => {
        setData(undefined);
        rentalContractReportList(month, year).then(setData);
    }, [month, year]);

    useEffect(() => {
        setTerminatedData(undefined);
        terminatedContractReport(terminatedMonth, terminatedYear).then(setTerminatedData);
    }, [terminatedMonth, terminatedYear]);

    const typeLabels = buildLookup(options, 'type');
    const guaranteeLabels = buildLookup(options, 'guarantee');
    const pcfLabels = buildLookup(options, 'pcf');
    const terminationReasonLabels = buildLookup(options, 'terminationReason');

    const Filters = ({ monthVal, yearVal, onMonth, onYear }: {
        monthVal: number;
        yearVal: number;
        onMonth: (v: number) => void;
        onYear: (v: number) => void;
    }) => (
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

    return (
        <div className={styles.propertyPageContainer}>
            <div className={styles.propertyPageHeader}>
                <h1 className={styles.propertyPageTitle}>Imóveis</h1>
                <p className={styles.propertyPageSubtitle}>Lorem ipsum dolor sit amet</p>
            </div>
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'ativos' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('ativos')}
                >
                    Contratos Ativos
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'reajustados' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('reajustados')}
                >
                    Contratos Reajustados
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'rescindidos' ? styles.tabButtonActive : ''}`}
                    onClick={() => setActiveTab('rescindidos')}
                >
                    Contratos Rescindidos
                </button>
            </div>

            {activeTab === 'ativos' && (
                <div className={styles.chartsGrid}>
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
                                            label
                                        >
                                            {Object.entries(data.contractType as Record<string, number>).map((_, index) => (
                                                <Cell key={index} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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
                                    <p className={styles.chartTitle}>FCI</p>
                                    <span className={styles.chartTotal}>{sumValues(data.pcf as Record<string, number>)}</span>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(data.pcf as Record<string, number>).map(([key, value]) => ({
                                                name: pcfLabels[key] ?? key,
                                                value
                                            }))}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {Object.entries(data.pcf as Record<string, number>).map((_, index) => (
                                                <Cell key={index} fill={COLORS_PCF[index % COLORS_PCF.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
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
            )}

            {activeTab === 'reajustados' && (
                <div className={styles.tabContent}>
                    <p>Conteúdo de Contratos Reajustados</p>
                </div>
            )}

            {activeTab === 'rescindidos' && (
                <div className={styles.chartsGrid}>
                    <Filters
                        monthVal={terminatedMonth}
                        yearVal={terminatedYear}
                        onMonth={setTerminatedMonth}
                        onYear={setTerminatedYear}
                    />
                    {terminatedData && (
                        <>
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <p className={styles.chartTitle}>Garantia</p>
                                <span className={styles.chartTotal}>{sumValues(terminatedData.guarantees as Record<string, number>)}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(terminatedData.guarantees as Record<string, number>).map(([key, value]) => ({
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
                                        {Object.entries(terminatedData.guarantees as Record<string, number>).map((_, index) => (
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
                                <span className={styles.chartTotal}>{sumValues(terminatedData.terminationReasons as Record<string, number>)}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={Object.entries(terminatedData.terminationReasons as Record<string, number>)
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
                                        {Object.entries(terminatedData.terminationReasons as Record<string, number>)
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
            )}
        </div>
    )
}
