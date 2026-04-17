'use client';
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { realtimeReportData, getMonthlyClosing, getManagerCommission, getInnovationFund } from "@/services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import {
    DocumentTextIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
    ReceiptPercentIcon,
    UserGroupIcon,
    BriefcaseIcon,
    BanknotesIcon,
    DocumentMagnifyingGlassIcon,
    ChartBarSquareIcon,
    InformationCircleIcon,
    TableCellsIcon,
    PercentBadgeIcon,
    CalendarDateRangeIcon,
    CalendarDaysIcon,
    PresentationChartLineIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import styles from '../financial.module.scss';


const months = [
    { value: 0, label: "Janeiro" },
    { value: 1, label: "Fevereiro" },
    { value: 2, label: "Março" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Maio" },
    { value: 5, label: "Junho" },
    { value: 6, label: "Julho" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Setembro" },
    { value: 9, label: "Outubro" },
    { value: 10, label: "Novembro" },
    { value: 11, label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2017 }, (_, i) => 2018 + i);

export default function SalesPage() {
    // Estado para gráfico anual diário
    const [selectedAnnualMonth, setSelectedAnnualMonth] = useState<number>(new Date().getMonth());
    const [dailyChartData, setDailyChartData] = useState<Array<{ day: string, taxaAdministracao: number, taxaIntermediacao: number, bonificacao: number }>>([]);
    // Busca valor e nome do serviço pelo índice customizado
    function getAmountWithService(original: any[], idx: string) {
        const found = original.find((item: any) => item.index === idx);
        return {
            amount: found ? Number(found.amount) : null,
            service: found ? found.service || found.name || null : null
        };
    }
    // Estado para gráfico anual
    const [selectedAnnualType, setSelectedAnnualType] = useState<'bonificacao' | 'taxaAdministracao' | 'taxaIntermediacao'>('bonificacao');
    const [annualChartData, setAnnualChartData] = useState<Array<{ month: string, value: number }>>([]);
    const [annualClosingData, setAnnualClosingData] = useState<Array<{
        month: string,
        receitaBruta: number | null,
        totalDespesasPessoal: number | null,
        despesasNormais: number | null,
        receitaLiquida: number | null,
        fundoDeReserva: number | null,
        fundoInovacaoFetched: number | null,
        resultadoLiquido: number | null,
        folhaPagamento: number | null,
        investimentos: number | null,
        impostos: number | null,
        totalDespesas: number | null,
        lucroLiquido: number | null,
        comissaoGestores: number | null,
        retirada: number | null
    }>>([]);

    // Estado para gráfico de área empilhada (5 anos)
    const [annualStackedData, setAnnualStackedData] = useState<Array<{
        year: string;
        receitaBruta: number;
        despesas: number;
        retirada: number;
    }>>([]);
    // Exporta os dados da tabela anual para Excel
    const exportToExcel = () => {
        if (!annualClosingData || annualClosingData.length === 0) return;
        // Remove formatação monetária para exportação
        const exportData = annualClosingData.map(row => ({
            Mês: row.month,
            'Receita Bruta': row.receitaBruta ?? '',
            'Despesas com Pessoal': row.totalDespesasPessoal ?? '',
            'Despesas Normais': row.despesasNormais ?? '',
            'Receita Liquida': row.receitaLiquida ?? '',
            'Fundo de Inovação 5%': row.fundoInovacaoFetched ?? '',
            'Fundo de Reserva 5%': row.fundoDeReserva ?? '',
            'Resultado Líquido': row.resultadoLiquido ?? '',
            'Folha de Pagamento': row.folhaPagamento ?? '',
            'Investimentos': row.investimentos ?? '',
            'Impostos': row.impostos ?? '',
            'Despesas': row.totalDespesas ?? '',
            'Lucro Líquido': row.lucroLiquido ?? '',
            'Comissão Gestores': row.comissaoGestores ?? '',
            'Retirada': row.retirada ?? ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Fechamento Anual');
        XLSX.writeFile(workbook, 'fechamento_anual.xlsx');
    };

    const formatBRL = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // States for query (actual data fetching)
    const [queryMonth, setQueryMonth] = useState(selectedMonth);
    const [queryYear, setQueryYear] = useState(selectedYear);

    const handleSearch = () => {
        setQueryMonth(selectedMonth);
        setQueryYear(selectedYear);
    };

    const selectedSection = 2; // Fixed to 2 for Vendas
    const [totalDespesasPessoalExtras, setTotalDespesasPessoalExtras] = useState<number | null>(null);
    const [totalDespesasPessoal, setTotalDespesasPessoal] = useState<number | null>(null);
    const [comissaoFolha, setComissaoFolha] = useState<number | null>(null);
    const [fundoDeReserva, setFundoDeReserva] = useState<number | null>(null);
    const [folhaDePagamento, setFolhaDePagamento] = useState<number | null>(null);
    const [despesasNormais, setDespesasNormais] = useState<number | null>(null);
    const [investimentos, setInvestimentos] = useState<number | null>(null);
    const [receitaBruta, setReceitaBruta] = useState<number | null>(null);
    const [receitaLiquida, setReceitaLiquida] = useState<number | null>(null);
    const [resultadoLiquido, setResultadoLiquido] = useState<number | null>(null);
    const [calculoFolhaPagamento, setCalculoFolhaPagamento] = useState<number | null>(null);
    const [lucroLiquido, setLucroLiquido] = useState<number | null>(null);
    const [comissaoGestor, setComissaoGestor] = useState<number | null>(null);
    const [porcetagemRetirada, setPorcentagemRetirada] = useState<number | null>(null);
    const [corretores, setCorretores] = useState<number | null>(null);
    const [despesasMenosCorretagem, setDespesasMenosCorretagem] = useState<number | null>(null);
    const [proLaboreData, setProLaboreData] = useState<number | null>(null);
    const [comissaoGestorFetched, setComissaoGestorFetched] = useState<number | null>(null);
    const [fundoInovacaoFetched, setFundoInovacaoFetched] = useState<number | null>(null);

    // States related to Vendas (can be kept or removed if not used)
    const [vendaValorFixo, setVendaValorFixo] = useState<number>(0);
    const [vendaVariavel, setVendaVariavel] = useState<number>(0);
    const [margemContribuicao, setMargemContribuicao] = useState<number>(0);
    const [margemContribuicaoPorcento, setMargemContribuicaoPorcento] = useState<number>(0);
    const [pontoEquilibrio, setPontoEquilibrio] = useState<number>(0);

    const [impostos, setImpostos] = useState<number>(0);
    const [totalDespesas, setTotalDespesas] = useState<number>(0);
    const [retirada, setRetirada] = useState<number>(0);
    const [customIndexes, setCustomIndexes] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState("");
    const [customValues, setCustomValues] = useState<Array<{ amount: number | null, service: string | null }>>([
        { amount: null, service: null },
        { amount: null, service: null },
        { amount: null, service: null },
        { amount: null, service: null },
        { amount: null, service: null }
    ]);
    const [customLoading, setCustomLoading] = useState(false);

    // States for monthly closing (Moved from reports)
    const [sinaisNegocio, setSinaisNegocio] = useState<string>("");
    const [comissoesReceber, setComissoesReceber] = useState<number>(0);
    const [comissoesReceberProxMes, setComissoesReceberProxMes] = useState<string>("");
    const [observacaoClosing, setObservacaoClosing] = useState<string>("");


    // Fetch Monthly Closing Data
    useEffect(() => {
        const mesNum = queryMonth;
        const anoNum = queryYear;
        getMonthlyClosing(mesNum, anoNum).then(data => {
            if (data && (
                data.sinais_negocio !== null ||
                data.comissoes_receber !== null ||
                data.observacao
            )) {
                setSinaisNegocio(data.sinais_negocio ? formatBRL(data.sinais_negocio) : "");
                setComissoesReceber(data.comissoes_receber ? Number(data.comissoes_receber) : 0);
                setComissoesReceberProxMes(data.comissoes_receber_prox_mes ? formatBRL(data.comissoes_receber_prox_mes) : "");
                setObservacaoClosing(data.observacao || "");
            } else {
                setSinaisNegocio("");
                setComissoesReceber(0);
                setComissoesReceberProxMes("");
                setObservacaoClosing("");
            }
        }).catch(err => console.error("Error fetching closing data", err));

        // Fetch Manager Commission
        getManagerCommission(mesNum, anoNum).then(data => {
            if (data && data.comissao_gestor !== null && data.comissao_gestor !== undefined) {
                setComissaoGestorFetched(Number(data.comissao_gestor));
            } else {
                setComissaoGestorFetched(null);
            }
        }).catch(err => {
            console.error("Error fetching manager commission", err);
            setComissaoGestorFetched(null);
        });

        // Fetch Innovation Fund
        getInnovationFund(mesNum, anoNum).then(data => {
            if (data && data.fundo_inovacao !== null && data.fundo_inovacao !== undefined) {
                setFundoInovacaoFetched(Number(data.fundo_inovacao));
            } else {
                setFundoInovacaoFetched(null);
            }
        }).catch(err => {
            console.error("Error fetching innovation fund", err);
            setFundoInovacaoFetched(null);
        });
    }, [queryMonth, queryYear]);

    // Atualiza os índices customizados
    const handleCustomIndexChange = (idx: number, value: string) => {
        const newIndexes = [...customIndexes];
        newIndexes[idx] = value;
        setCustomIndexes(newIndexes);
    };

    const handleAddCustomIndex = () => {
        const val = customInput.trim();
        if (val && customIndexes.length < 5 && !customIndexes.includes(val)) {
            setCustomIndexes([...customIndexes, val]);
            setCustomInput("");
        }
    };
    const handleRemoveCustomIndex = (idx: number) => {
        setCustomIndexes(customIndexes.filter((_, i) => i !== idx));
    };

    useEffect(() => {
        const startDate = new Date(queryYear, queryMonth, 1);
        const endDate = new Date(queryYear, queryMonth + 1, 0);
        const body = {
            section: selectedSection,
            companies: [1, 3, 4, 5, 6, 8, 9],
            dteRange: [
                startDate.toISOString(),
                endDate.toISOString()
            ]
        };
        realtimeReportData(body)
            .then((res) => {
                const receita = res.receitas?.find((r: any) => r.index === "1.1");
                const despesa = res.despesas?.find((d: any) => d.index === "1.2");
                const original = res.original || [];
                const getAmount = (idx: string) => {
                    const found = original.find((item: any) => item.index === idx);
                    return found ? Number(found.amount) : 0;
                };
                // const locacao = getAmount("1.1.1");
                const folhaEDespesa = getAmount("1.2.1");
                const folhaPagamento = getAmount("1.2.2.1");
                const outrasDespesasPessoal = getAmount("1.2.2.2");
                const proLabore = getAmount("1.2.2.1.12");
                const salarios = getAmount("1.2.2.1.14");
                const gratificacoesPremiacoes = getAmount("1.2.2.5");
                const comissaoLocacaoImoveis = getAmount("1.2.2.3");
                const despesasGerais = getAmount("1.2.1.1");
                const telefones = getAmount("1.2.1.2");
                const entidadesDeClasses = getAmount("1.2.1.3");
                const materiais = getAmount("1.2.1.4");
                const propagandaPublicidadeInstitucional = getAmount("1.2.1.5");
                const propagandaPublicidadeProduto = getAmount("1.2.1.6");
                const despesasComVeiculos = getAmount("1.2.1.7");
                const seguros = getAmount("1.2.1.8");
                const assessorias = getAmount("1.2.1.9");
                const servicos = getAmount("1.2.1.10");
                const manutencoes = getAmount("1.2.1.11");
                const ajudaDeCusto = getAmount("1.2.2.6");
                const copaCozinha = getAmount("1.2.1.13");
                const comemoracoes = getAmount("1.2.1.14");
                const viagens = getAmount("1.2.1.16");
                const tarifasBancarias = getAmount("1.2.3.1");
                const tarifaCartaoCredito = getAmount("1.2.3.3");
                const impostosData = getAmount("1.2.4");
                const impostosMunicipais = getAmount("1.2.4.2");
                const doacoes = getAmount("1.2.1.12");
                const prejuizos = getAmount("1.2.8");
                const bens = getAmount("1.2.9.2");
                const comissaoDecorrenteVendaImoveis = getAmount("1.2.2.4");
                const investimentosVals = getAmount("1.2.9.4");
                const comissaoVendaEfetuada = getAmount("1.2.2.4.4");
                // const assinaturas = getAmount("1.2.1.15");
                const jurosPagos = getAmount("1.2.3.2");
                const prejuizoVendas = getAmount("1.2.8.1.2");
                const taxas = getAmount("1.2.4.3");

                const despesasNormaisCalc = (
                    despesasGerais +
                    telefones
                    + entidadesDeClasses
                    + materiais
                    + propagandaPublicidadeInstitucional
                    + propagandaPublicidadeProduto
                    + despesasComVeiculos
                    + seguros
                    + assessorias
                    + servicos
                    + manutencoes
                    + doacoes
                    + copaCozinha
                    + comemoracoes
                    // + assinaturas (1.2.1.15) removed
                    + viagens
                    + tarifasBancarias
                    + jurosPagos
                    + tarifaCartaoCredito
                    + impostosData
                    + prejuizos // 1.2.8
                    + bens // 1.2.9.2
                    + taxas // 1.2.4.3
                    + prejuizoVendas
                );

                setDespesasNormais(despesasNormaisCalc);
                setReceitaBruta(receita?.amount ?? 0);

                setImpostos(impostosData);
                setInvestimentos(investimentosVals);

                const primeiroCalcDespesaPessoalExtra = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal)
                const totalDespesasPessoalExtrasCalc = primeiroCalcDespesaPessoalExtra - Math.abs(proLabore) - Math.abs(salarios);
                setTotalDespesasPessoalExtras(totalDespesasPessoalExtrasCalc);

                console.log("folha e pessoal- folhaPagamento:", folhaPagamento, "outrasDespesasPessoal:", outrasDespesasPessoal, "comissaoDecorrenteVendaImoveis:", comissaoDecorrenteVendaImoveis, "gratificacoesPremiacoes:", gratificacoesPremiacoes, "proLabore:", proLabore, "comissaoVendaEfetuada:", comissaoVendaEfetuada)
                const totalDespesasPessoalCalc = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal) + Math.abs(comissaoDecorrenteVendaImoveis) + Math.abs(comissaoLocacaoImoveis) + Math.abs(gratificacoesPremiacoes) - Math.abs(proLabore) - Math.abs(comissaoVendaEfetuada);
                setTotalDespesasPessoal(totalDespesasPessoalCalc);

                let comissaoFolhaCalc = 0;
                if (totalDespesasPessoalCalc) {
                    comissaoFolhaCalc = Math.abs(totalDespesasPessoalCalc) - Math.abs(totalDespesasPessoalExtrasCalc) - Math.abs(salarios);
                    setComissaoFolha(comissaoFolhaCalc);
                }

                setFolhaDePagamento(folhaPagamento);

                let receitaLiquidaCalc = 0;
                if (totalDespesasPessoalExtrasCalc && despesasNormaisCalc) {
                    receitaLiquidaCalc = Math.abs(receita?.amount ?? 0) - Math.abs(despesasNormaisCalc) - Math.abs(totalDespesasPessoalCalc);
                    console.log("receita bruta: ", receita?.amount, "despesas normais: ", Math.abs(despesasNormaisCalc), "total despesas pessoal: ", totalDespesasPessoalCalc);
                    setReceitaLiquida(receitaLiquidaCalc);
                }

                let fundoDeReservaCalc = 0;
                if (receitaLiquidaCalc) {
                    fundoDeReservaCalc = receitaLiquidaCalc * 0.05;
                    setFundoDeReserva(fundoDeReservaCalc);
                }

                let resultadoLiquidoCalc = 0;
                if (receitaLiquidaCalc && corretores && fundoInovacaoFetched) {
                    resultadoLiquidoCalc = Math.abs(receitaLiquidaCalc) - Math.abs(corretores) - Number(fundoInovacaoFetched);
                    console.log("receita liquida: ", receitaLiquidaCalc, "corretores: ", corretores, "fundo inovacao: ", fundoInovacaoFetched);
                    setResultadoLiquido(resultadoLiquidoCalc);
                }

                let calculoFolhaPagamentoCalc = 0;
                if (comissaoFolhaCalc && salarios) {
                    calculoFolhaPagamentoCalc = Math.abs(comissaoFolhaCalc) + Math.abs(salarios);
                    setCalculoFolhaPagamento(calculoFolhaPagamentoCalc);
                }

                if (resultadoLiquidoCalc || calculoFolhaPagamento || investimentosVals) {
                    const lucroLiquidoCalc = Math.abs(resultadoLiquidoCalc ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentosVals ?? 0);
                    setLucroLiquido(lucroLiquidoCalc);
                }

                let resultadoFixo = 0;
                if (despesasNormais || impostos || totalDespesasPessoal) {
                    console.log("calculo fixo: ", despesasNormais, impostos, totalDespesasPessoal);
                    resultadoFixo = Math.abs(despesasNormaisCalc ?? 0) - Math.abs(impostosData ?? 0) + Math.abs(totalDespesasPessoalCalc ?? 0);
                    setVendaValorFixo(resultadoFixo);
                }

                let currentComissaoGestor: number | null = null;
                if (comissaoGestorFetched !== null) {
                    currentComissaoGestor = comissaoGestorFetched;
                }
                setComissaoGestor(currentComissaoGestor);

                if (comissaoFolha && salarios) {
                    const calculoFolhaPagamentoCalc = Math.abs(comissaoFolha) + Math.abs(salarios);
                    setCalculoFolhaPagamento(calculoFolhaPagamentoCalc);
                }

                if (impostos || fundoInovacaoFetched || currentComissaoGestor || comissaoVendaEfetuada) {
                    console.log("impostos", impostos, "comissaoGestor", currentComissaoGestor, "comissaoVendaEfetuada", comissaoVendaEfetuada);
                    const resultadoVariavel = Math.abs(impostos) + Math.abs(comissaoVendaEfetuada) + Math.abs(currentComissaoGestor ?? 0);
                    setVendaVariavel(resultadoVariavel);
                }
                let margemContribuicaoCalculo = Math.abs(receitaBruta ?? 0) - Math.abs(vendaVariavel ?? 0);
                if (margemContribuicaoCalculo) {
                    setMargemContribuicao(margemContribuicaoCalculo ?? 0);
                }

                if (resultadoLiquido || calculoFolhaPagamento || investimentosVals || currentComissaoGestor) {
                    const retiradaCalc = (resultadoLiquido ?? 0) - Math.abs(currentComissaoGestor ?? 0);
                    console.log("resultado liquido: ", resultadoLiquido, "comissao gestor: ", currentComissaoGestor);
                    setRetirada(retiradaCalc);
                }
                if (receitaBruta && retirada) {
                    const porcentagemRetiradaCalc = Math.abs(retirada) / Math.abs(receitaBruta) * 100;
                    setPorcentagemRetirada(porcentagemRetiradaCalc);
                }
                if (despesa || totalDespesasPessoal) {
                    const totalDespesaCalc = Math.abs(totalDespesasPessoalCalc ?? 0) + Math.abs(corretores ?? 0) + Math.abs(despesasNormais ?? 0) + Number(fundoInovacaoFetched) + Math.abs(comissaoGestor ?? 0);
                    console.log("total despesas pessoal: ", Math.abs(totalDespesasPessoalCalc ?? 0), "corretores: ", Math.abs(corretores ?? 0), "despesas normais: ", Math.abs(despesasNormais ?? 0), "fundo de inovação: ", Number(fundoInovacaoFetched), "comissão gestor: ", Math.abs(comissaoGestor ?? 0));
                    setTotalDespesas(-Math.abs(totalDespesaCalc));
                }
                if (comissaoVendaEfetuada) {
                    setCorretores(comissaoVendaEfetuada)
                }
                if (despesa && corretores) {
                    const despesasMenosCorretagemCalc = Math.abs(despesa.amount ?? 0) - Math.abs(corretores);
                    setDespesasMenosCorretagem(despesasMenosCorretagemCalc);
                }
                if (proLabore) {
                    const proLaboreCalc = Math.abs(proLabore);
                    setProLaboreData(proLaboreCalc);
                }
                let resultadoMC = 0;
                if (margemContribuicaoCalculo && receitaBruta) {
                    console.log("margemContribuicao", margemContribuicaoCalculo, "receitaBruta", receitaBruta);
                    resultadoMC = margemContribuicaoCalculo / Math.abs(receitaBruta);
                    setMargemContribuicaoPorcento(resultadoMC);
                }
                if (resultadoFixo && resultadoMC) {
                    console.log("vendaValorFixo", resultadoFixo, "margemContribuicaoPorcento", resultadoMC);
                    const resultadoMV = resultadoFixo / resultadoMC;
                    setPontoEquilibrio(resultadoMV);
                }
            }).catch((err) => {
                setComissaoFolha(null);
                console.error("Erro ao buscar contas em tempo real:", err);
            });
    }, [queryMonth, queryYear, totalDespesasPessoal, totalDespesasPessoalExtras, fundoInovacaoFetched, impostos, lucroLiquido, comissaoGestorFetched]);

    useEffect(() => {
        const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        async function fetchMonthsSequentially() {
            const results = [];
            for (const m of months) {
                const startDate = new Date(queryYear, m.value, 1);
                const endDate = new Date(queryYear, m.value + 1, 0);
                const body = {
                    section: selectedSection,
                    companies: [1, 3, 4, 5, 6, 8, 9],
                    dteRange: [
                        startDate.toISOString(),
                        endDate.toISOString()
                    ]
                };
                try {
                    const [res, closingData, managerData, innovationData] = await Promise.all([
                        realtimeReportData(body),
                        getMonthlyClosing(m.value, queryYear),
                        getManagerCommission(m.value, queryYear).catch(() => null),
                        getInnovationFund(m.value, queryYear).catch(() => null)
                    ]);
                    const receita = res.receitas?.find((r: any) => r.index === "1.1");
                    const despesa = res.despesas?.find((d: any) => d.index === "1.2");
                    const original = res.original || [];
                    const getAmount = (idx: string) => {
                        const found = original.find((item: any) => item.index === idx);
                        return found ? Number(found.amount) : 0;
                    };
                    const folhaPagamento = getAmount("1.2.2.1");
                    const outrasDespesasPessoal = getAmount("1.2.2.2");
                    const proLabore = getAmount("1.2.2.1.12");
                    const salarios = getAmount("1.2.2.1.14");
                    const gratificacoesPremiacoes = getAmount("1.2.2.5");
                    const comissaoLocacaoImoveis = getAmount("1.2.2.3");
                    const despesasGerais = getAmount("1.2.1.1");
                    const telefones = getAmount("1.2.1.2");
                    const entidadesDeClasses = getAmount("1.2.1.3");
                    const materiais = getAmount("1.2.1.4");
                    const propagandaPublicidadeInstitucional = getAmount("1.2.1.5");
                    const propagandaPublicidadeProduto = getAmount("1.2.1.6");
                    const despesasComVeiculos = getAmount("1.2.1.7");
                    const seguros = getAmount("1.2.1.8");
                    const assessorias = getAmount("1.2.1.9");
                    const servicos = getAmount("1.2.1.10");
                    const manutencoes = getAmount("1.2.1.11");
                    const ajudaDeCusto = getAmount("1.2.2.6");
                    const copaCozinha = getAmount("1.2.1.13");
                    const comemoracoes = getAmount("1.2.1.14");
                    const viagens = getAmount("1.2.1.16");
                    const locacaoMaquinasEquipamentos = getAmount("1.2.9.2.3");
                    const tarifasBancarias = getAmount("1.2.3.1");
                    const tarifaCartaoCredito = getAmount("1.2.3.3");
                    const impostosFederais = getAmount("1.2.4.1");
                    const impostosMunicipais = getAmount("1.2.4.2");
                    const doacoes = getAmount("1.2.1.12");
                    const jurosPagos = getAmount("1.2.3.2");
                    const prejuizos = getAmount("1.2.8");
                    const bens = getAmount("1.2.9.2");
                    const direitos = getAmount("1.2.9.3");
                    const investimentosVals = getAmount("1.2.9.4");
                    const taxas = getAmount("1.2.4.3");
                    const despesasNormais =
                        // despesasGerais removed
                        telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + doacoes + copaCozinha + comemoracoes + viagens + tarifasBancarias + jurosPagos + tarifaCartaoCredito + impostosFederais + impostosMunicipais + prejuizos + bens + direitos + investimentosVals + taxas;

                    const comissoesReceber = closingData?.comissoes_receber ? Number(closingData.comissoes_receber) : 0;

                    const receitaBruta = receita?.amount ?? null;
                    const totalDespesas = despesa?.amount ?? null;
                    const impostos = getAmount("1.2.4");

                    const primeiroCalcDespesaPessoalExtra = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal);
                    const totalDespesasPessoalExtras = primeiroCalcDespesaPessoalExtra - Math.abs(proLabore) - Math.abs(salarios);

                    const totalDespesasPessoal = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal) + Math.abs(gratificacoesPremiacoes) + Math.abs(comissaoLocacaoImoveis) + Math.abs(ajudaDeCusto) - Math.abs(proLabore);

                    let comissaoFolha = 0;
                    if (totalDespesasPessoal) {
                        comissaoFolha = Math.abs(totalDespesasPessoal) - Math.abs(totalDespesasPessoalExtras) - Math.abs(salarios);
                    }

                    let receitaLiquida = 0;
                    if (totalDespesasPessoalExtras && despesasNormais) {
                        receitaLiquida = Math.abs(receitaBruta ?? 0) - Math.abs(despesasNormais);
                    }

                    let fundoDeReserva = 0;
                    if (receitaLiquida) {
                        fundoDeReserva = receitaLiquida * 0.05;
                    }

                    let localFundoInovacao: number | null = null;
                    if (innovationData && innovationData.fundo_inovacao !== null && innovationData.fundo_inovacao !== undefined) {
                        localFundoInovacao = Number(innovationData.fundo_inovacao);
                    }

                    let resultadoLiquido = 0;
                    if (receitaLiquida) {
                        resultadoLiquido = Number(receitaLiquida) - Number(localFundoInovacao);
                    }

                    let calculoFolhaPagamento = 0;
                    if (comissaoFolha && salarios) {
                        calculoFolhaPagamento = Math.abs(comissaoFolha) + Math.abs(salarios);
                    }

                    let lucroLiquido = 0;
                    if (resultadoLiquido || calculoFolhaPagamento || investimentosVals) {
                        lucroLiquido = Math.abs(resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentosVals ?? 0);
                    }

                    let comissaoGestor: number | null = null;
                    if (managerData && managerData.comissao_gestor !== null && managerData.comissao_gestor !== undefined) {
                        comissaoGestor = Number(managerData.comissao_gestor);
                    }

                    let retirada = null;
                    if (resultadoLiquido || calculoFolhaPagamento || investimentosVals || comissaoGestor) {
                        retirada = (resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentosVals ?? 0) - Math.abs(comissaoGestor ?? 0);
                    }
                    results.push({
                        month: monthAbbr[m.value],
                        receitaBruta,
                        totalDespesasPessoal,
                        despesasNormais,
                        receitaLiquida,
                        fundoDeReserva,
                        fundoInovacaoFetched: localFundoInovacao,
                        resultadoLiquido,
                        folhaPagamento,
                        investimentos,
                        impostos,
                        totalDespesas,
                        lucroLiquido,
                        comissaoGestores: comissaoGestor,
                        retirada
                    });
                } catch {
                    results.push({
                        month: monthAbbr[m.value],
                        receitaBruta: null,
                        totalDespesasPessoal: null,
                        despesasNormais: null,
                        receitaLiquida: null,
                        fundoDeReserva: null,
                        fundoInovacaoFetched: null,
                        resultadoLiquido: null,
                        folhaPagamento: null,
                        investimentos: null,
                        impostos: null,
                        totalDespesas: null,
                        lucroLiquido: null,
                        comissaoGestores: null,
                        retirada: null
                    });
                }
            }
            setAnnualClosingData(results);
        }
        fetchMonthsSequentially();
    }, [queryYear]);


    useEffect(() => {
        const daysInMonth = new Date(queryYear, selectedAnnualMonth + 1, 0).getDate();
        const promises = Array.from({ length: daysInMonth }, (_, i) => {
            const startDate = new Date(queryYear, selectedAnnualMonth, i + 1);
            const endDate = new Date(queryYear, selectedAnnualMonth, i + 1);
            const body = {
                section: selectedSection,
                companies: [1, 3, 4, 5, 6, 8, 9],
                dteRange: [
                    startDate.toISOString(),
                    endDate.toISOString()
                ]
            };
            return realtimeReportData(body).then((res: any) => {
                const original = res.original || [];
                const getAmount = (idx: string) => {
                    const found = original.find((item: any) => item.index === idx);
                    return found ? Number(found.amount) : 0;
                };
                return {
                    day: String(i + 1),
                    taxaAdministracao: getAmount("1.1.1.1.11"),
                    taxaIntermediacao: getAmount("1.1.1.1.12"),
                    bonificacao: getAmount("2.1.1.1.9")
                };
            }).catch(() => ({ day: String(i + 1), taxaAdministracao: 0, taxaIntermediacao: 0, bonificacao: 0 }));
        });
        Promise.all(promises).then(setDailyChartData);
    }, [queryYear, selectedAnnualMonth]);

    // Buscar dados mensais para o gráfico anual
    useEffect(() => {
        const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const promises = months.map((m) => {
            const startDate = new Date(queryYear, m.value, 1);
            const endDate = new Date(queryYear, m.value + 1, 0);
            const body = {
                section: selectedSection,
                companies: [1, 3, 4, 5, 6, 8, 9],
                dteRange: [
                    startDate.toISOString(),
                    endDate.toISOString()
                ]
            };
            return realtimeReportData(body).then((res: any) => {
                const original = res.original || [];
                const getAmount = (idx: string) => {
                    const found = original.find((item: any) => item.index === idx);
                    return found ? Number(found.amount) : 0;
                };
                let value = 0;
                if (selectedAnnualType === 'taxaAdministracao') value = getAmount("1.1.1.1.11");
                if (selectedAnnualType === 'taxaIntermediacao') value = getAmount("1.1.1.1.12");
                if (selectedAnnualType === 'bonificacao') value = getAmount("2.1.1.1.9");
                return {
                    month: `${monthAbbr[m.value]}/${selectedYear}`,
                    value
                };
            }).catch(() => ({ month: `${monthAbbr[m.value]}/${queryYear}`, value: 0 }));
        });
        Promise.all(promises).then(setAnnualChartData);
    }, [queryYear, selectedAnnualType]);

    // Busca os valores quando todos os campos estão preenchidos
    useEffect(() => {
        if (customIndexes.length !== 5) {
            setCustomValues([
                { amount: null, service: null },
                { amount: null, service: null },
                { amount: null, service: null },
                { amount: null, service: null },
                { amount: null, service: null }
            ]);
            return;
        }
        setCustomLoading(true);
        const startDate = new Date(queryYear, queryMonth, 1);
        const endDate = new Date(queryYear, queryMonth + 1, 0);
        const body = {
            section: selectedSection,
            companies: [1, 3, 4, 5, 6, 8, 9],
            dteRange: [
                startDate.toISOString(),
                endDate.toISOString()
            ]
        };
        realtimeReportData(body)
            .then((res: any) => {
                const original = res.original || [];
                const values = customIndexes.map(idx => getAmountWithService(original, idx));
                if (true) {
                    setCustomValues(values);
                } else {
                    setCustomValues([
                        { amount: null, service: null },
                        { amount: null, service: null },
                        { amount: null, service: null },
                        { amount: null, service: null },
                        { amount: null, service: null }
                    ]);
                }
                setCustomLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching custom indices:", err);
                setCustomValues([
                    { amount: null, service: null },
                    { amount: null, service: null },
                    { amount: null, service: null },
                    { amount: null, service: null },
                    { amount: null, service: null }
                ]);
                setCustomLoading(false);
            });
    }, [customIndexes, queryMonth, queryYear]);

    // 5-Year Area Chart Data Fetching
    const [fiveYearData, setFiveYearData] = useState<any[]>([]);

    useEffect(() => {
        const yearsToFetch = [2021, 2022, 2023, 2024, 2025];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        let chartData = monthNames.map(name => ({ name }));
        setFiveYearData([...chartData]);

        const fetchAllData = async () => {
            const currentChartData = [...chartData];

            for (const year of yearsToFetch) {
                for (const m of months) {
                    const startDate = new Date(year, m.value, 1);
                    const endDate = new Date(year, m.value + 1, 0);
                    const body = {
                        section: selectedSection,
                        companies: [1, 3, 4, 5, 6, 8, 9],
                        dteRange: [startDate.toISOString(), endDate.toISOString()]
                    };

                    try {
                        const res = await realtimeReportData(body);
                        const original = res.original || [];
                        const item = original.find((i: any) => i.index === "1.1");
                        const amount = item ? Number(item.amount) : 0;

                        const updatedMonthData: any = { ...currentChartData[m.value] };
                        updatedMonthData[year] = amount;
                        currentChartData[m.value] = updatedMonthData;
                    } catch (error) {
                        console.error(`Error fetching ${m.label}/${year}`, error);
                        const updatedMonthData: any = { ...currentChartData[m.value] };
                        updatedMonthData[year] = 0;
                        currentChartData[m.value] = updatedMonthData;
                    }
                }
                setFiveYearData([...currentChartData]);
            }
        };

        fetchAllData();
    }, []);

    // Fetch 5-Year Data for Stacked Area Chart
    useEffect(() => {
        const fetchAnnualStackedData = async () => {
            const yearsToFetch = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
            const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            let allMonthsData: any[] = [];

            for (const year of yearsToFetch) {
                const currentMonthIndex = new Date().getMonth();
                const monthsToFetch = year === currentYear
                    ? months.filter(m => m.value <= currentMonthIndex)
                    : months;

                const promises = monthsToFetch.map(async (m) => {
                    const startDate = new Date(year, m.value, 1);
                    const endDate = new Date(year, m.value + 1, 0);

                    try {
                        const body = {
                            section: selectedSection,
                            companies: [1, 3, 4, 5, 6, 8, 9],
                            dteRange: [startDate.toISOString(), endDate.toISOString()]
                        };
                        const res = await realtimeReportData(body);
                        const original = res.original || [];
                        const getAmount = (idx: string) => {
                            const found = original.find((item: any) => item.index === idx);
                            return found ? Number(found.amount) : 0;
                        };

                        const receitaBruta = getAmount("1.1");

                        const folhaPagamento = getAmount("1.2.2.1");
                        const outrasDespesasPessoal = getAmount("1.2.2.2");
                        const proLabore = getAmount("1.2.2.1.12");
                        const salarios = getAmount("1.2.2.1.14");
                        const gratificacoesPremiacoes = getAmount("1.2.2.5");
                        const comissaoLocacaoImoveis = getAmount("1.2.2.3");
                        const despesasGerais = getAmount("1.2.1.1");
                        const telefones = getAmount("1.2.1.2");
                        const entidadesDeClasses = getAmount("1.2.1.3");
                        const materiais = getAmount("1.2.1.4");
                        const propagandaPublicidadeInstitucional = getAmount("1.2.1.5");
                        const propagandaPublicidadeProduto = getAmount("1.2.1.6");
                        const despesasComVeiculos = getAmount("1.2.1.7");
                        const seguros = getAmount("1.2.1.8");
                        const assessorias = getAmount("1.2.1.9");
                        const servicos = getAmount("1.2.1.10");
                        const manutencoes = getAmount("1.2.1.11");
                        const ajudaDeCusto = getAmount("1.2.2.6");
                        const copaCozinha = getAmount("1.2.1.13");
                        const comemoracoes = getAmount("1.2.1.14");
                        const viagens = getAmount("1.2.1.16");
                        const locacaoMaquinasEquipamentos = getAmount("1.2.9.2.3");
                        const tarifasBancarias = getAmount("1.2.3.1");
                        const tarifaCartaoCredito = getAmount("1.2.3.3");
                        const impostosData = getAmount("1.2.4");
                        const impostos = impostosData;
                        const doacoes = getAmount("1.2.1.12");
                        const jurosPagos = getAmount("1.2.3.2");
                        const prejuizos = getAmount("1.2.8");
                        const bens = getAmount("1.2.9.2");
                        const direitos = getAmount("1.2.9.3");
                        const investimentosVals = getAmount("1.2.9.4");
                        const taxas = getAmount("1.2.4.3");
                        const comissaoVendaEfetuada = getAmount("1.2.2.4.4");
                        const despesasNormais =
                            // despesasGerais removed
                            telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + doacoes + copaCozinha + comemoracoes + viagens + tarifasBancarias + jurosPagos + tarifaCartaoCredito + impostosData + prejuizos + bens + direitos + investimentosVals + taxas;

                        const primeiroCalcTotalDespesasExtras = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal);
                        const totalDespesasPessoalExtras = primeiroCalcTotalDespesasExtras - Math.abs(proLabore) - Math.abs(salarios);

                        // Mesma fórmula do topo: folha + outras + gratificações + comissaoLocacao + ajudaCusto - proLabore
                        const totalDespesasPessoal = Math.abs(folhaPagamento) + Math.abs(outrasDespesasPessoal) + Math.abs(gratificacoesPremiacoes) + Math.abs(comissaoLocacaoImoveis) + Math.abs(ajudaDeCusto) - Math.abs(proLabore);

                        const closingData = await getMonthlyClosing(m.value, year).catch(() => null);
                        const managerData = await getManagerCommission(m.value, year).catch(() => null);
                        const innovationData = await getInnovationFund(m.value, year).catch(() => null);

                        let comissaoGestor = 0;
                        if (managerData && managerData.comissao_gestor !== null && managerData.comissao_gestor !== undefined) {
                            comissaoGestor = Number(managerData.comissao_gestor);
                        }

                        let localFundoInovacao = 0;
                        if (innovationData && innovationData.fundo_inovacao !== null && innovationData.fundo_inovacao !== undefined) {
                            localFundoInovacao = Number(innovationData.fundo_inovacao);
                        }

                        // receitaLiquida = receitaBruta - despesasNormais - totalDespesasPessoal (igual ao topo, linha 353)
                        let receitaLiquida = 0;
                        if (totalDespesasPessoalExtras && despesasNormais) {
                            receitaLiquida = Math.abs(receitaBruta ?? 0) - Math.abs(despesasNormais) - Math.abs(totalDespesasPessoal);
                        }

                        // resultadoLiquido = receitaLiquida - corretores(comissaoVendaEfetuada) - fundoInovacao (igual ao topo, linha 366)
                        let resultadoLiquido = 0;
                        if (receitaLiquida && comissaoVendaEfetuada && localFundoInovacao) {
                            resultadoLiquido = Math.abs(receitaLiquida) - Math.abs(comissaoVendaEfetuada) - Number(localFundoInovacao);
                        }

                        // retirada = resultadoLiquido - comissaoGestor (igual ao topo, linha 411)
                        let retirada = 0;
                        if (resultadoLiquido || comissaoGestor) {
                            retirada = resultadoLiquido - Math.abs(comissaoGestor);
                        }

                        // totalDespesas = totalDespesasPessoal + corretores + despesasNormais + fundoInovacao + comissaoGestor (igual ao topo, linha 420)
                        const totalDespesasCalc = Math.abs(totalDespesasPessoal) + Math.abs(comissaoVendaEfetuada) + Math.abs(despesasNormais) + Number(localFundoInovacao) + Math.abs(comissaoGestor);

                        return {
                            year: `${monthAbbr[m.value]}/${year.toString().slice(-2)}`,
                            fullDate: startDate,
                            receitaBruta: receitaBruta,
                            despesas: totalDespesasCalc,
                            retirada: retirada > 0 ? retirada : 0
                        };
                    } catch (err) {
                        console.error(`Error fetching data for ${m.label}/${year}`, err);
                        return {
                            year: `${monthAbbr[m.value]}/${year.toString().slice(-2)}`,
                            fullDate: startDate,
                            receitaBruta: 0,
                            despesas: 0,
                            retirada: 0
                        };
                    }
                });

                const yearResults = await Promise.all(promises);
                yearResults.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
                allMonthsData = [...allMonthsData, ...yearResults];

                setAnnualStackedData([...allMonthsData]);
            }
        };

        fetchAnnualStackedData();
    }, []);




    return (
        <div className={styles.financialPageContainer}>
            <div className={styles.financialPageHeader}>
                <h1 className={styles.financialPageTitle}>Financeiro - Vendas</h1>
                <p className={styles.financialPageSubtitle}>Visão geral das receitas e despesas de Vendas</p>
            </div>

            <div className={styles.financialPageActionContent}>
                <div className={styles.financialPageFiltersContainer}>
                    <div className={styles.financialPageSelectContent}>
                        <select className={`${styles.financialPageSelect} ${styles.financialPageSelectMonth}`} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.financialPageSelectContent}>
                        <select className={`${styles.financialPageSelect} ${styles.financialPageSelectYear}`} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button className={styles.financialPageSearchButton} onClick={handleSearch}>
                        <MagnifyingGlassIcon width={20} height={20} />
                        Buscar
                    </button>
                </div>
                <Link className={styles.financialPageLink} href={`/dashboard/financial/reports?month=${selectedMonth}&year=${selectedYear}&section=${selectedSection}`}>
                    <DocumentTextIcon width={24} height={24} /> Fechamento
                </Link>
            </div>
            <div className={styles.financialPageHeader}>
                <h2
                    className={styles.financialPageTitle}
                    style={{ fontSize: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <CalendarDateRangeIcon width={20} height={20} />
                    Dados Mensais
                </h2>
            </div>
            <div className={styles.mainInfoContainer}>
                <div className={`${styles.mainInfoBox} ${styles.infoReceitaLiquida}`}>
                    <p className={styles.infoValue}>
                        <span className={styles.infoLabel}>
                            RECEITA BRUTA
                        </span>
                        <br />
                        {receitaBruta !== null ? formatBRL(receitaBruta) : '---'}
                    </p>
                    <div className={styles.infoIcon}>
                        <ArrowTrendingUpIcon height={32} width={32} color="#00a63e" />
                    </div>
                </div>
                <div className={`${styles.mainInfoBox} ${styles.infoTotalDespesas}`}>
                    <p className={styles.infoValue}>
                        <span className={styles.infoLabel}>
                            TOTAL DESPESAS
                        </span>
                        <br />
                        {totalDespesas ? formatBRL(totalDespesas) : '---'}
                    </p>
                    <div className={styles.infoIcon}>
                        <ArrowTrendingDownIcon height={32} width={32} color="#e7000b" />
                    </div>
                </div>
                <div className={`${styles.mainInfoBox} ${styles.infoRetirada}`}>
                    <p className={styles.infoValue}>
                        <span className={styles.infoLabel}>
                            RETIRADA
                        </span>
                        <br />
                        {retirada !== null ? formatBRL(retirada) : '---'}
                    </p>
                    <div className={styles.infoIcon}>
                        <CurrencyDollarIcon height={32} width={32} color="#155dfc" />
                    </div>
                </div>
                <div className={`${styles.mainInfoBox} ${styles.infoRetirada}`}>
                    <p className={styles.infoValue}>
                        <span className={styles.infoLabel}>
                            % RETIRADA
                        </span>
                        <br />
                        {porcetagemRetirada !== null ? porcetagemRetirada.toFixed(2) : '---'}%
                    </p>
                    <div className={styles.infoIcon}>
                        <ReceiptPercentIcon height={32} width={32} color="#155dfc" />
                    </div>
                </div>
            </div>
            <div className={styles.graphicsContainer}>
                <div className={styles.despesasCharts}>
                    <h2 className={styles.chartTitle}>Pizza Resumo Total</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={(() => {
                                    const pieData = [
                                        { value: Math.abs(despesasNormais ?? 0), name: 'Despesas Normais' },
                                        { value: Math.abs(totalDespesasPessoal ?? 0), name: 'Despesas com Pessoal' },
                                        { value: Math.abs(folhaDePagamento ?? 0), name: 'Folha de Pagamento' },
                                        { value: Math.abs(fundoInovacaoFetched ?? 0), name: 'Fundo Inovação' },
                                        { value: Math.abs(comissaoGestor ?? 0), name: 'Comissão Gestores' },
                                        { value: Math.abs(investimentos ?? 0), name: 'Investimentos' },
                                        { value: Math.abs(retirada ?? 0), name: 'Retirada' }
                                    ];
                                    const total = pieData.reduce((acc, item) => acc + item.value, 0);

                                    return pieData.map(item => ({
                                        ...item,
                                        percent: total ? item.value / total : 0
                                    }));
                                })()}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                fill="#1e3a5f"
                                isAnimationActive={true}
                                outerRadius={100}
                                label={({ x, y, cx, value, percent, name }: any) => (
                                    <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${formatBRL(value)} (${(percent * 100).toFixed(2)}%)`}
                                    </text>
                                )}
                            >
                                {[0, 1, 2, 3, 4, 5, 6].map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c'][index]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [formatBRL(value as number), name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.fluxoCharts}>
                    <div style={{ marginBottom: 16 }}>
                        <label htmlFor="annualTypeSelect" style={{ marginRight: 8 }}>Selecione o tipo:</label>
                        <select
                            id="annualTypeSelect"
                            value={selectedAnnualType}
                            onChange={e => setSelectedAnnualType(e.target.value as 'bonificacao' | 'taxaAdministracao' | 'taxaIntermediacao')}
                            style={{ padding: '4px 8px', borderRadius: 4 }}
                        >
                            <option value="bonificacao">Bonificação</option>
                            <option value="taxaAdministracao">Taxa de Administração</option>
                            <option value="taxaIntermediacao">Taxa de Intermediação</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={annualChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tickFormatter={formatBRL} hide />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(value: number) => formatBRL(value)} />
                            <Area type="monotone" dataKey="value" name={selectedAnnualType === 'taxaAdministracao' ? 'Taxa de Administração' : selectedAnnualType === 'taxaIntermediacao' ? 'Taxa de Intermediação' : 'Bonificação'} stroke={selectedAnnualType === 'taxaAdministracao' ? '#0088FE' : selectedAnnualType === 'taxaIntermediacao' ? '#00C49F' : '#FFBB28'} fill={selectedAnnualType === 'taxaAdministracao' ? '#0088FE' : selectedAnnualType === 'taxaIntermediacao' ? '#00C49F' : '#FFBB28'} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.customInfoSection}>
                <h4 className={styles.customInfoSectionTitle}> <InformationCircleIcon width={20} height={20} /> Informações Destaques</h4>
                <div className={styles.customInfoSectionAddContent}>
                    <input
                        type="text"
                        value={customInput}
                        className={styles.customInfoSectionInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder="Digite o índice"
                        disabled={customIndexes.length >= 5}
                    />
                    <button
                        type="button"
                        onClick={handleAddCustomIndex}
                        className={styles.customInfoSectionAddButton}
                        disabled={!customInput.trim() || customIndexes.length >= 5}
                    >
                        Adicionar
                    </button>
                    <span className={styles.customInfoSectionCount}>
                        ({customIndexes.length}/5)
                    </span>
                </div>
                <div className={styles.customInfoSectionCountContent}>
                    {customIndexes.map((idx, i) => (
                        <span className={styles.customInfoSectionIndex} key={i}>
                            {idx}
                            <button type="button" onClick={() => handleRemoveCustomIndex(i)} className={styles.customInfoSectionRemoveButton}>×</button>
                        </span>
                    ))}
                </div>
                {customLoading && <div>Carregando...</div>}
                {!customLoading && customIndexes.length === 5 && (
                    <div className={styles.customInfoSectionValuesContainer}>
                        {customValues.map((v, idx) => (
                            <div className={styles.customInfoSectionValuesContent} key={idx}>
                                <div className={styles.customInfoSectionValuesResult}>{v.amount !== null ? formatBRL(v.amount) : '---'}</div>
                                <div className={styles.customInfoSectionValuesTitle}>{v.service || `Índice ${customIndexes[idx]}`}</div>
                            </div>
                        ))}
                    </div>
                )}
                {customIndexes.length !== 5 && <div className={styles.customInfoSectionAddMessage}>Adicione 5 índices para exibir as informações.</div>}
            </div>
            <div className={styles.despesasPessoalInfoContainer}>
                <h4 className={styles.despesasPessoalInfoTitle}><UserGroupIcon width={20} height={20} /> Resumo Fechamento</h4>
                <div className={styles.despesasPessoalInfoContent}>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            FOLHA E PESSOAL
                        </span>
                        <br />
                        {totalDespesasPessoal !== null ? formatBRL(-Math.abs(totalDespesasPessoal)) : '---'}
                    </div>

                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            COMISSÃO GESTÃO
                        </span>
                        <br />
                        {comissaoGestor !== null ? formatBRL(-Math.abs(comissaoGestor)) : '---'}
                    </div>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            RECEITA LIQUIDA
                        </span>
                        <br />
                        {receitaLiquida !== null ? formatBRL(-Math.abs(receitaLiquida)) : '---'}
                    </div>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            CORRETORES
                        </span>
                        <br />
                        {corretores !== null ? formatBRL(-Math.abs(corretores)) : '---'}
                    </div>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            DESPESAS MENOS CORRETAGEM
                        </span>
                        <br />
                        {despesasMenosCorretagem !== null ? formatBRL(-Math.abs(despesasMenosCorretagem)) : '---'}
                    </div>
                </div>
            </div>

            <div className={styles.closingSalesContainer}>
                <h4 className={styles.closingSalesTitle}><PercentBadgeIcon width={20} height={20} /> Fechamento Vendas</h4>
                <div className={styles.closingSalesCardsContainer}>
                    <div className={styles.closingSalesCard}>
                        <p>
                            <span>Fixo</span>
                            <br />
                            {vendaValorFixo !== null ? formatBRL(vendaValorFixo) : '---'}
                        </p>
                    </div>
                    <div className={styles.closingSalesCard}>
                        <p>
                            <span>Variável</span>
                            <br />
                            {vendaVariavel !== null ? formatBRL(vendaVariavel) : '---'}
                        </p>
                    </div>
                    <div className={styles.closingSalesCard}>
                        <p>
                            <span>Margem de Contribuição</span>
                            <br />
                            {margemContribuicao !== null ? formatBRL(margemContribuicao) : '---'}
                        </p>
                    </div>
                    <div className={styles.closingSalesCard}>
                        <p>
                            <span>MC em %</span>
                            <br />
                            {margemContribuicaoPorcento !== null ? (margemContribuicaoPorcento * 100).toFixed(2) + '%' : '---'}
                        </p>
                    </div>
                    <div className={styles.closingSalesCard}>
                        <p>
                            <span>Ponto de Equilíbrio</span>
                            <br />
                            {pontoEquilibrio !== null ? formatBRL(pontoEquilibrio) : '---'}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.despesasNormaisInfoContainer}>
                <div className={`${styles.despesasNormaisInfoItem} ${styles.cardDespesasNormais}`}>
                    <p className={styles.despesasNormaisInfoText}>
                        <span className={styles.despesasNormaisInfoLabel} style={{ fontSize: 12, color: '#888' }}>
                            DESPESAS NORMAIS
                        </span>
                        <br />
                        {despesasNormais !== null ? formatBRL(despesasNormais) : '---'}
                    </p>
                    <div className={styles.despesasNormaisInfoIcon}>
                        <BriefcaseIcon width={24} height={24} color="#155dfc" />
                    </div>
                </div>
                <div className={`${styles.despesasNormaisInfoItem} ${styles.cardInvestimentos}`}>
                    <p className={styles.despesasNormaisInfoText}>
                        <span className={styles.despesasNormaisInfoLabel} style={{ fontSize: 12, color: '#888' }}>
                            INVESTIMENTOS
                        </span>
                        <br />
                        {investimentos !== null ? formatBRL(investimentos) : '---'}
                    </p>
                    <div className={styles.despesasNormaisInfoIcon}>
                        <ChartBarSquareIcon width={24} height={24} color="#155dfc" />
                    </div>
                </div>
                <div className={`${styles.despesasNormaisInfoItem} ${styles.cardImpostos}`}>
                    <p className={styles.despesasNormaisInfoText}>
                        <span className={styles.despesasNormaisInfoLabel} style={{ fontSize: 12, color: '#888' }}>
                            IMPOSTOS
                        </span>
                        <br />
                        {impostos !== null ? formatBRL(impostos) : '---'}
                    </p>
                    <div className={styles.despesasNormaisInfoIcon}>
                        <DocumentMagnifyingGlassIcon width={24} height={24} color="#155dfc" />
                    </div>
                </div>
                <div className={`${styles.despesasNormaisInfoItem} ${styles.cardFundoReserva}`}>
                    <p className={styles.despesasNormaisInfoText}>
                        <span className={styles.despesasNormaisInfoLabel} style={{ fontSize: 12, color: '#888' }}>
                            FUNDO DE INOVAÇÃO
                        </span>
                        <br />
                        {fundoInovacaoFetched !== null
                            ? formatBRL(fundoInovacaoFetched)
                            : '---'}
                    </p>
                    <div className={styles.despesasNormaisInfoIcon}>
                        <BanknotesIcon width={24} height={24} color="#155dfc" />
                    </div>
                </div>
            </div>
            <div className={styles.financialPageHeader}>
                <h2
                    className={styles.financialPageTitle}
                    style={{ fontSize: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CalendarDaysIcon width={20} height={20} />
                    Dados Anuais
                </h2>
            </div>
            <div className={styles.annualInfoContainer}>
                <h2 className={styles.chartTitle}><PresentationChartLineIcon width={20} height={20} /> Storytelling Baggio</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={annualStackedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={2} />
                        <YAxis yAxisId="left" hide tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} width={80} />
                        <YAxis yAxisId="right" orientation="right" hide tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} width={80} />
                        <Tooltip formatter={(value: number) => formatBRL(value)} />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="receitaBruta"
                            name="Receita Bruta"
                            stroke="#00a63e"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="despesas"
                            name="Despesas"
                            stroke="#e7000b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="retirada"
                            name="Retirada"
                            stroke="#155dfc"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className={styles.annualInfoContainer}>
                <h2 className={styles.chartTitle}><CurrencyDollarIcon width={20} height={20} /> Receita Financeira</h2>
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={fiveYearData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val)} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(value: number) => formatBRL(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="2021" stroke="#8884d8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="2022" stroke="#82ca9d" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="2023" stroke="#ffc658" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="2024" stroke="#ff7300" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="2025" stroke="#0088FE" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className={styles.annualClosingDataContainer}>
                <div className={styles.annualClosingDataTitle}>
                    <h4 className={styles.annualClosingDataTitleText}><BriefcaseIcon width={20} height={20} /> Dados do Fechamento</h4>
                    <button onClick={exportToExcel} className={styles.annualClosingDataExportButton}>
                        <TableCellsIcon width={20} height={20} /> Exportar para Excel
                    </button>
                </div>
                <div className={styles.annualClosingDataContent}>
                    <div className={styles.anualClosingDataTableContainer}>
                        <table className={styles.annualClosingDataTable}>
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Receita Bruta</th>
                                    <th>Despesas com Pessoal</th>
                                    <th>Despesas Normais</th>
                                    <th>Receita Liquida</th>
                                    <th>Fundo de Inovação 5%</th>
                                    <th>Fundo de Reserva 5%</th>
                                    <th>Resultado Líquido</th>
                                    <th>Folha de Pagamento</th>
                                    <th>Investimentos</th>
                                    <th>Impostos</th>
                                    <th>Despesas</th>
                                    <th>Lucro Líquido</th>
                                    <th>Comissão Gestores</th>
                                    <th>Retirada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {annualClosingData.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        style={{ background: idx % 2 === 0 ? '#ccf' : '#99f' }}
                                    >
                                        <td>{row.month}</td>
                                        <td>{row.receitaBruta !== null ? formatBRL(row.receitaBruta) : '---'}</td>
                                        <td>{row.totalDespesasPessoal !== null ? formatBRL(row.totalDespesasPessoal) : '---'}</td>
                                        <td>{row.despesasNormais !== null ? formatBRL(row.despesasNormais) : '---'}</td>
                                        <td>{row.receitaLiquida !== null ? formatBRL(row.receitaLiquida) : '---'}</td>
                                        <td>{row.fundoInovacaoFetched !== null ? formatBRL(row.fundoInovacaoFetched) : '---'}</td>
                                        <td>{formatBRL(0)}</td>
                                        <td>{row.resultadoLiquido !== null ? formatBRL(row.resultadoLiquido) : '---'}</td>
                                        <td>{row.folhaPagamento !== null ? formatBRL(row.folhaPagamento) : '---'}</td>
                                        <td>{row.investimentos !== null ? formatBRL(row.investimentos) : '---'}</td>
                                        <td>{row.impostos !== null ? formatBRL(row.impostos) : '---'}</td>
                                        <td>{row.totalDespesas !== null ? formatBRL(row.totalDespesas) : '---'}</td>
                                        <td>{row.lucroLiquido !== null ? formatBRL(row.lucroLiquido) : '---'}</td>
                                        <td>{row.comissaoGestores !== null ? formatBRL(row.comissaoGestores) : '---'}</td>
                                        <td>{row.retirada !== null ? formatBRL(row.retirada) : '---'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );

}
