'use client';

import { useEffect, useState } from "react";
import { realtimeReportData, getMonthlyClosing } from "@/services/api";
import { FinancialDashboardFilters } from "@/components/financial/FinancialDashboardFilters";
import { KpiCards } from "@/components/financial/KpiCards";
import {
  FINANCIAL_MONTHS,
  FINANCIAL_YEARS,
  MONTH_ABBR,
} from "@/lib/financial/constants";
import { formatBRL } from "@/lib/financial/format";
import { getAmountFromOriginal } from "@/lib/financial/amounts";
import { calcDespesasPessoal } from "@/lib/financial/despesasPessoalCalc";
import {
  buildRealtimeReportBody,
  buildRealtimeReportBodyFromRange,
} from "@/lib/financial/reportBody";
import { useDespesasNormais } from "@/hooks/useDespesasNormais";
import { useDespesasPessoal } from "@/hooks/useDespesasPessoal";
import { useImpostos } from "@/hooks/useImpostos";
import { useInvestimentos } from "@/hooks/useInvestimentos";
import type { FinancialSection, RealtimeReportResponse, ReportIndexItem } from "@/types/properfy";
import { Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieSummaryChart } from '@/components/financial/PieSummaryChart';
import { AnnualAreaChart } from '@/components/financial/AnnualAreaChart';
import {
  AnnualClosingTable,
  type RentalAnnualClosingRow,
} from '@/components/financial/AnnualClosingTable';
import { CustomIndexesSection } from '@/components/financial/CustomIndexesSection';
import { RentalFolhaPagamentoItem } from '@/components/financial/RentalFolhaPagamentoItem';

import {
    CurrencyDollarIcon,
    UserGroupIcon,
    BriefcaseIcon,
    BanknotesIcon,
    DocumentMagnifyingGlassIcon,
    ChartBarSquareIcon,
    PercentBadgeIcon,
    CalendarDateRangeIcon,
    CalendarDaysIcon,
    PresentationChartLineIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import styles from '@/app/dashboard/financial/financial.module.scss';

const months = FINANCIAL_MONTHS;
const years = FINANCIAL_YEARS;
const currentYear = new Date().getFullYear();

type FiveYearRow = {
  name: string;
  [key: string]: string | number | undefined;
};

type AnnualStackedPoint = {
  year: string;
  fullDate: Date;
  receitaBruta: number;
  despesas: number;
  retirada: number;
};

interface RentalDashboardContentProps {
  section: FinancialSection;
  title: string;
  subtitle: string;
}

export function RentalDashboardContent({
  section: selectedSection,
  title,
  subtitle,
}: RentalDashboardContentProps) {
    // Estado para gráfico anual diário
    const [selectedAnnualMonth, setSelectedAnnualMonth] = useState<number>(new Date().getMonth());
    const [dailyChartData, setDailyChartData] = useState<Array<{ day: string, taxaAdministracao: number, taxaIntermediacao: number, bonificacao: number }>>([]);
    const [apiData, setApiData] = useState<RealtimeReportResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const despesasNormaisFromHook = useDespesasNormais(apiData);
    const despesasPessoalFromHook = useDespesasPessoal(apiData, selectedSection);
    const impostosFromHook = useImpostos(apiData);
    const investimentosFromHook = useInvestimentos(apiData);
    // Estado para gráfico anual
    const [selectedAnnualType, setSelectedAnnualType] = useState<'bonificacao' | 'taxaAdministracao' | 'taxaIntermediacao'>('bonificacao');
    const [annualChartData, setAnnualChartData] = useState<Array<{ month: string, value: number }>>([]);
    const [annualClosingData, setAnnualClosingData] = useState<RentalAnnualClosingRow[]>([]);

    // Estado para gráfico de área empilhada (5 anos)
    const [annualStackedData, setAnnualStackedData] = useState<Array<{
        year: string;
        fullDate: Date;
        receitaBruta: number;
        despesas: number;
        retirada: number;
    }>>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // States for query (actual data fetching)
    const [queryMonth, setQueryMonth] = useState(selectedMonth);
    const [queryYear, setQueryYear] = useState(selectedYear);

    const handleSearch = () => {
        setQueryMonth(selectedMonth);
        setQueryYear(selectedYear);
    };

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

    // States related to Vendas (can be kept or removed if not used)
    const [vendaValorFixo, setVendaValorFixo] = useState<number>(0);
    const [vendaVariavel, setVendaVariavel] = useState<number>(0);
    const [margemContribuicao, setMargemContribuicao] = useState<number>(0);
    const [margemContribuicaoPorcento, setMargemContribuicaoPorcento] = useState<number>(0);
    const [pontoEquilibrio, setPontoEquilibrio] = useState<number>(0);

    const [impostos, setImpostos] = useState<number>(0);
    const [dimob, setDimob] = useState<number>(0);
    const [totalDespesas, setTotalDespesas] = useState<number>(0);
    const [retirada, setRetirada] = useState<number>(0);
    const [fundoInovacao, setFundoInovacao] = useState<number>(0);

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
        }).catch(() => setError('Não foi possível carregar o fechamento mensal.'));
    }, [queryMonth, queryYear]);

    useEffect(() => {
        const body = buildRealtimeReportBody(selectedSection, queryYear, queryMonth);
        setLoading(true);
        setError(null);
        realtimeReportData(body)
            .then((res) => {
                setApiData(res);
                const receita = res.receitas?.find((r) => r.index === "1.1");
                const despesa = res.despesas?.find((d) => d.index === "1.2");
                const original: ReportIndexItem[] = res.original ?? [];
                const getAmount = (idx: string) => getAmountFromOriginal(original, idx);
                // const locacao = getAmount("1.1.1");
                const folhaPagamento = getAmount("1.2.2.1");
                const dimobData = getAmount("1.1.1.1.34");
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
                const impostosFederais = getAmount("1.2.4.1");
                const impostosMunicipais = getAmount("1.2.4.2");
                const doacoes = getAmount("1.2.1.12");
                const prejuizoDecorrenteAdmImoveis = getAmount("1.2.8.1");
                const bens = getAmount("1.2.9.2");
                const direitos = getAmount("1.2.9");
                const investimentosVals = getAmount("1.2.9.4");
                const comissaoVendaEfetuada = getAmount("1.2.2.4.4");
                const assinaturas = getAmount("1.2.1.15");
                const jurosPagos = getAmount("1.2.3.2");

                const despesasNormaisCalc = (
                    despesasGerais
                    + telefones
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
                    + assinaturas
                    + viagens
                    + tarifasBancarias
                    + jurosPagos
                    + tarifaCartaoCredito
                    + impostosFederais
                    + impostosMunicipais
                    + prejuizoDecorrenteAdmImoveis
                );

                setDespesasNormais(despesasNormaisFromHook || despesasNormaisCalc);
                setReceitaBruta(Number(receita?.amount ?? 0));

                const impostosTotal = impostosFromHook || impostosFederais + impostosMunicipais;
                setImpostos(impostosTotal);
                setInvestimentos(investimentosFromHook || investimentosVals);

                const despesasPessoalCalc = calcDespesasPessoal(original, selectedSection);
                const totalDespesasPessoalExtrasCalc = despesasPessoalCalc.totalDespesasPessoalExtras;
                const totalDespesasPessoalCalc = despesasPessoalCalc.totalDespesasPessoal;
                const comissaoFolhaCalc = despesasPessoalCalc.comissaoFolha;
                const calculoFolhaPagamentoCalc = despesasPessoalCalc.folhaPagamentoFinal;

                setTotalDespesasPessoalExtras(totalDespesasPessoalExtrasCalc);
                setTotalDespesasPessoal(totalDespesasPessoalCalc);
                setComissaoFolha(comissaoFolhaCalc);
                setCalculoFolhaPagamento(calculoFolhaPagamentoCalc);

                setFolhaDePagamento(folhaPagamento);

                let receitaLiquidaCalc = 0;
                if (totalDespesasPessoalExtrasCalc && despesasNormaisCalc) {
                    receitaLiquidaCalc = Math.abs(Number(receita?.amount ?? 0)) - Math.abs(totalDespesasPessoalExtrasCalc) - Math.abs(despesasNormaisCalc);
                    setReceitaLiquida(receitaLiquidaCalc);
                }

                let fundoDeReservaCalc = 0;
                if (receitaLiquidaCalc) {
                    fundoDeReservaCalc = receitaLiquidaCalc * 0.05;
                    setFundoDeReserva(fundoDeReservaCalc);
                }

                let fundoInovacaoCalc = 0;
                if (receitaLiquidaCalc) {
                    fundoInovacaoCalc = receitaLiquidaCalc * 0.05; // Fixed for Locação
                    setFundoInovacao(fundoInovacaoCalc);
                }

                let resultadoLiquidoCalc = 0;
                if (receitaLiquidaCalc) {
                    resultadoLiquidoCalc = Number(receitaLiquidaCalc) - Number(fundoInovacaoCalc);
                    setResultadoLiquido(resultadoLiquidoCalc);
                }
                if (dimobData) {
                    setDimob(dimobData);
                }

                let lucroLiquidoCalc = 0;
                if (resultadoLiquidoCalc || calculoFolhaPagamentoCalc || investimentosVals) {
                    lucroLiquidoCalc = Math.abs(resultadoLiquidoCalc ?? 0) - Math.abs(calculoFolhaPagamentoCalc ?? 0) - Math.abs(investimentosVals ?? 0);
                    console.log("Resultado Liquido", resultadoLiquidoCalc, "Calculo Folha Pagamento", folhaDePagamento, "Investimentos", investimentosVals);
                    setLucroLiquido(lucroLiquidoCalc);
                }

                if (folhaPagamento || despesasNormaisCalc || impostosTotal) {
                    const resultadoFixo = Math.abs(despesasNormaisCalc) - Math.abs(impostosTotal) + Math.abs(folhaPagamento);
                    setVendaValorFixo(resultadoFixo);
                }

                let comissaoGestorCalc = 0;
                if (lucroLiquidoCalc) {
                    console.log("Lucro Liquido", lucroLiquidoCalc);
                    comissaoGestorCalc = lucroLiquidoCalc * 0.213;
                    setComissaoGestor(comissaoGestorCalc);
                }
                if (receitaLiquida) {
                    setFundoInovacao(receitaLiquida * 0.05);
                }

                if (impostos || fundoInovacao || comissoesReceber || comissaoVendaEfetuada) {
                    const resultadoVariavel = Math.abs(impostos) + Math.abs(fundoInovacao) + Math.abs(comissaoVendaEfetuada) + Math.abs(comissoesReceber);
                    setVendaVariavel(resultadoVariavel);
                }
                if (receitaBruta && totalDespesas) {
                    setMargemContribuicao(Math.abs(receitaBruta) + Math.abs(totalDespesas));
                }
                if (margemContribuicao && receitaBruta) {
                    const resultadoMC = margemContribuicao / receitaBruta;
                    setMargemContribuicaoPorcento(resultadoMC);
                }
                if (vendaValorFixo && margemContribuicaoPorcento) {
                    const resultadoMV = -vendaValorFixo / margemContribuicaoPorcento;
                    setPontoEquilibrio(resultadoMV);
                }
                if (totalDespesasPessoalExtrasCalc || despesasNormais || comissaoGestorCalc || fundoInovacao || comissaoFolhaCalc || investimentosVals || salarios) {
                    const calculoTotalDespesas = Math.abs(totalDespesasPessoalExtrasCalc ?? 0) + Math.abs(salarios ?? 0) + Math.abs(comissaoFolhaCalc ?? 0) + Math.abs(despesasNormais ?? 0) + Math.abs(fundoInovacao ?? 0) + Math.abs(investimentosVals ?? 0) + Math.abs(comissaoGestorCalc ?? 0);
                    setTotalDespesas(calculoTotalDespesas);
                }

                if (resultadoLiquidoCalc || calculoFolhaPagamentoCalc || investimentosVals || comissaoGestorCalc) {
                    const retiradaCalc = (resultadoLiquidoCalc ?? 0) - Math.abs(calculoFolhaPagamentoCalc ?? 0) - Math.abs(investimentosVals ?? 0) - Math.abs(comissaoGestorCalc ?? 0);
                    setRetirada(retiradaCalc);

                    if (receita?.amount) {
                        const porcentagemRetiradaCalc = Math.abs(retiradaCalc) / Math.abs(Number(receita.amount)) * 100;
                        setPorcentagemRetirada(porcentagemRetiradaCalc);
                    }
                }
            })
            .catch(() => {
                setComissaoFolha(null);
                setApiData(null);
                setError('Não foi possível carregar os dados em tempo real. Tente novamente.');
            })
            .finally(() => setLoading(false));
    }, [
        queryMonth,
        queryYear,
        selectedSection,
        totalDespesasPessoal,
        totalDespesasPessoalExtras,
        fundoInovacao,
        impostos,
        lucroLiquido,
        despesasNormaisFromHook,
        despesasPessoalFromHook,
        impostosFromHook,
        investimentosFromHook,
    ]);

    useEffect(() => {
        const monthAbbr = [...MONTH_ABBR];
        async function fetchMonthsSequentially() {
            const results = [];
            for (const m of months) {
                const body = buildRealtimeReportBody(selectedSection, queryYear, m.value);
                try {
                    const [res, closingData] = await Promise.all([
                        realtimeReportData(body),
                        getMonthlyClosing(m.value, queryYear)
                    ]);
                    const receita = res.receitas?.find((r) => r.index === "1.1");
                    const despesa = res.despesas?.find((d) => d.index === "1.2");
                    const original: ReportIndexItem[] = res.original ?? [];
                    const getAmount = (idx: string) => getAmountFromOriginal(original, idx);
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
                    const impostosFederais = getAmount("1.2.4.1");
                    const impostosMunicipais = getAmount("1.2.4.2");
                    const prejuizoDecorrenteAdmImoveis = getAmount("1.2.8.1");
                    const bens = getAmount("1.2.9.2"); // Keep var, exclude from sum
                    const direitos = getAmount("1.2.9");
                    const investimentos = getAmount("1.2.9.4");
                    const doacoes = getAmount("1.2.1.12");
                    const assinaturas = getAmount("1.2.1.15");
                    const jurosPagos = getAmount("1.2.3.2");

                    const despesasNormais =
                        despesasGerais + telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + copaCozinha + comemoracoes + viagens + tarifasBancarias + tarifaCartaoCredito + impostosFederais + impostosMunicipais + prejuizoDecorrenteAdmImoveis + doacoes + assinaturas + jurosPagos;

                    const comissoesReceber = closingData?.comissoes_receber ? Number(closingData.comissoes_receber) : 0;

                    const receitaBruta =
                      receita?.amount != null ? Number(receita.amount) : null;
                    const totalDespesas = despesa?.amount ?? null;
                    const impostos = impostosFederais + impostosMunicipais;

                    const despesasPessoalCalc = calcDespesasPessoal(original, selectedSection);
                    const totalDespesasPessoalExtras = despesasPessoalCalc.totalDespesasPessoalExtras;
                    const totalDespesasPessoal = despesasPessoalCalc.totalDespesasPessoal;
                    const comissaoFolha = despesasPessoalCalc.comissaoFolha;
                    const calculoFolhaPagamento = despesasPessoalCalc.folhaPagamentoFinal;

                    let receitaLiquida = 0;
                    if (totalDespesasPessoalExtras && despesasNormais) {
                        receitaLiquida = Math.abs(Number(receitaBruta ?? 0)) - Math.abs(totalDespesasPessoalExtras) - Math.abs(despesasNormais);
                    }

                    let fundoInovacao = 0;
                    if (receitaLiquida) {
                        fundoInovacao = receitaLiquida * 0.05;
                    }

                    let fundoDeReserva = 0;
                    if (receitaLiquida) {
                        fundoDeReserva = receitaLiquida * 0.05;
                    }

                    let resultadoLiquido = 0;
                    if (receitaLiquida) {
                        resultadoLiquido = Number(receitaLiquida) - Number(fundoInovacao);
                    }

                    let lucroLiquido = 0;
                    if (resultadoLiquido || calculoFolhaPagamento || investimentos) {
                        lucroLiquido = Math.abs(resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentos ?? 0);
                    }

                    let comissaoGestor = 0;
                    if (lucroLiquido) {
                        comissaoGestor = lucroLiquido * 0.213;
                    }

                    let retirada = 0;
                    if (resultadoLiquido || calculoFolhaPagamento || investimentos || comissaoGestor) {
                        retirada = (resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentos ?? 0) - Math.abs(comissaoGestor ?? 0);
                    }

                    let calculoTotalDespesas = 0;
                    if (totalDespesasPessoalExtras || despesasNormais || comissaoGestor || fundoInovacao || comissaoFolha || investimentos || salarios) {
                        calculoTotalDespesas = Math.abs(totalDespesasPessoalExtras ?? 0) + Math.abs(salarios ?? 0) + Math.abs(comissaoFolha ?? 0) + Math.abs(despesasNormais ?? 0) + Math.abs(fundoInovacao ?? 0) + Math.abs(investimentos ?? 0) + Math.abs(comissaoGestor ?? 0);
                    }

                    results.push({
                        month: monthAbbr[m.value],
                        receitaBruta,
                        totalDespesasPessoal,
                        totalDespesasPessoalExtras,
                        despesasNormais,
                        receitaLiquida,
                        fundoDeReserva,
                        resultadoLiquido,
                        folhaPagamento,
                        calculoFolhaPagamento,
                        investimentos,
                        impostos,
                        totalDespesas: calculoTotalDespesas,
                        lucroLiquido,
                        comissaoGestores: comissaoGestor,
                        retirada
                    });
                } catch {
                    results.push({
                        month: monthAbbr[m.value],
                        receitaBruta: null,
                        totalDespesasPessoal: null,
                        totalDespesasPessoalExtras: null,
                        despesasNormais: null,
                        receitaLiquida: null,
                        fundoDeReserva: null,
                        resultadoLiquido: null,
                        folhaPagamento: null,
                        calculoFolhaPagamento: null,
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
            const body = buildRealtimeReportBodyFromRange(
              selectedSection,
              startDate,
              endDate
            );
            return realtimeReportData(body).then((res) => {
                const original: ReportIndexItem[] = res.original ?? [];
                const getAmount = (idx: string) => getAmountFromOriginal(original, idx);
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
        const monthAbbr = [...MONTH_ABBR];
        const promises = months.map((m) => {
            const body = buildRealtimeReportBody(selectedSection, queryYear, m.value);
            return realtimeReportData(body).then((res) => {
                const original: ReportIndexItem[] = res.original ?? [];
                const getAmount = (idx: string) => getAmountFromOriginal(original, idx);
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

    // 5-Year Area Chart Data Fetching
    const [fiveYearData, setFiveYearData] = useState<FiveYearRow[]>([]);

    useEffect(() => {
        const yearsToFetch = [2021, 2022, 2023, 2024, 2025];
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        const chartData = monthNames.map(name => ({ name }));
        setFiveYearData([...chartData]);

        const fetchAllData = async () => {
            const currentChartData = [...chartData];

            for (const year of yearsToFetch) {
                for (const m of months) {
                    const startDate = new Date(year, m.value, 1);
                    const endDate = new Date(year, m.value + 1, 0);
                    const body = buildRealtimeReportBodyFromRange(
                      selectedSection,
                      startDate,
                      endDate
                    );

                    try {
                        const res = await realtimeReportData(body);
                        const original: ReportIndexItem[] = res.original ?? [];
                        const item = original.find((i) => i.index === "1.1");
                        const amount = item ? Number(item.amount) : 0;

                        const updatedMonthData: FiveYearRow = { ...currentChartData[m.value] };
                        updatedMonthData[year] = amount;
                        currentChartData[m.value] = updatedMonthData;
                    } catch (error) {
                        console.error(`Error fetching ${m.label}/${year}`, error);
                        const updatedMonthData: FiveYearRow = { ...currentChartData[m.value] };
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
            const monthAbbr = [...MONTH_ABBR];

        let allMonthsData: AnnualStackedPoint[] = [];

            for (const year of yearsToFetch) {
                const currentMonthIndex = new Date().getMonth();
                const monthsToFetch = year === currentYear
                    ? months.filter(m => m.value <= currentMonthIndex)
                    : months;

                const promises = monthsToFetch.map(async (m) => {
                    const startDate = new Date(year, m.value, 1);
                    const endDate = new Date(year, m.value + 1, 0);

                    try {
                        const body = buildRealtimeReportBody(
                          selectedSection,
                          year,
                          m.value
                        );
                        const res = await realtimeReportData(body);
                        const original: ReportIndexItem[] = res.original ?? [];
                        const getAmount = (idx: string) => getAmountFromOriginal(original, idx);

                        const receitaBruta = getAmount("1.1");
                        const totalDespesas = getAmount("1.2");

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
                        const impostosFederais = getAmount("1.2.4.1");
                        const impostosMunicipais = getAmount("1.2.4.2");
                        const prejuizoDecorrenteAdmImoveis = getAmount("1.2.8.1");
                        const bens = getAmount("1.2.9.2"); // Keep variable for other uses if needed or remove? Plan said "Excludes locacao...". Main logic has bens variable but excludes from sum.
                        const direitos = getAmount("1.2.9");
                        const investimentos = getAmount("1.2.9.4");
                        const doacoes = getAmount("1.2.1.12");
                        const assinaturas = getAmount("1.2.1.15");
                        const jurosPagos = getAmount("1.2.3.2");

                        const despesasNormais =
                            despesasGerais + telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + copaCozinha + comemoracoes + viagens + tarifasBancarias + tarifaCartaoCredito + impostosFederais + impostosMunicipais + prejuizoDecorrenteAdmImoveis + doacoes + assinaturas + jurosPagos;

                        const despesasPessoalCalc = calcDespesasPessoal(original, selectedSection);
                        const totalDespesasPessoalExtras = despesasPessoalCalc.totalDespesasPessoalExtras;
                        const totalDespesasPessoal = despesasPessoalCalc.totalDespesasPessoal;
                        const comissaoFolha = despesasPessoalCalc.comissaoFolha;
                        const calculoFolhaPagamento = despesasPessoalCalc.folhaPagamentoFinal;

                        let receitaLiquida = 0;
                        if (totalDespesasPessoalExtras && despesasNormais) {
                            receitaLiquida = Math.abs(Number(receitaBruta ?? 0)) - Math.abs(totalDespesasPessoalExtras) - Math.abs(despesasNormais);
                        }

                        let fundoInovacao = 0;
                        if (receitaLiquida) {
                            fundoInovacao = receitaLiquida * 0.05;
                        }

                        let resultadoLiquido = 0;
                        if (receitaLiquida) {
                            resultadoLiquido = Number(receitaLiquida) - Number(fundoInovacao);
                        }

                        let lucroLiquido = 0;
                        if (resultadoLiquido || calculoFolhaPagamento || investimentos) {
                            lucroLiquido = Math.abs(resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentos ?? 0);
                        }

                        let comissaoGestor = 0;
                        if (lucroLiquido) {
                            comissaoGestor = lucroLiquido * 0.208;
                        }

                        const closingData = await getMonthlyClosing(m.value, year).catch(() => null);

                        let calculoTotalDespesas = 0;
                        if (totalDespesasPessoalExtras || despesasNormais || comissaoGestor || fundoInovacao || comissaoFolha || investimentos || salarios) {
                            calculoTotalDespesas = Math.abs(totalDespesasPessoalExtras ?? 0) + Math.abs(salarios ?? 0) + Math.abs(comissaoFolha ?? 0) + Math.abs(despesasNormais ?? 0) + Math.abs(fundoInovacao ?? 0) + Math.abs(investimentos ?? 0) + Math.abs(comissaoGestor ?? 0);
                        }

                        let retirada = 0;
                        if (resultadoLiquido || calculoFolhaPagamento || investimentos || comissaoGestor) {
                            retirada = (resultadoLiquido ?? 0) - Math.abs(calculoFolhaPagamento ?? 0) - Math.abs(investimentos ?? 0) - Math.abs(comissaoGestor ?? 0);
                        }

                        return {
                            year: `${monthAbbr[m.value]}/${year.toString().slice(-2)}`,
                            fullDate: startDate,
                            receitaBruta: receitaBruta,
                            despesas: calculoTotalDespesas,
                            retirada: retirada
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
                <h1 className={styles.financialPageTitle}>{title}</h1>
                <p className={styles.financialPageSubtitle}>{subtitle}</p>
            </div>

            <FinancialDashboardFilters
                loading={loading}
                error={error}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                section={selectedSection}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
                onSearch={handleSearch}
            />
            <div className={styles.financialPageHeader}>
                <h2
                    className={styles.financialPageTitle}
                    style={{ fontSize: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <CalendarDateRangeIcon width={20} height={20} />
                    Dados Mensais
                </h2>
            </div>
            <KpiCards
                receitaBruta={receitaBruta}
                totalDespesas={totalDespesas}
                retirada={retirada}
                porcentagemRetirada={porcetagemRetirada}
            />
            <div className={styles.graphicsContainer}>
                <div className={styles.despesasCharts}>
                    <h2 className={styles.chartTitle}>Pizza Resumo Total</h2>
                    <PieSummaryChart
                        dados={[
                            despesasNormais ?? 0,
                            totalDespesasPessoal ?? 0,
                            folhaDePagamento ?? 0,
                            fundoInovacao ?? 0,
                            comissoesReceber ?? 0,
                            investimentos ?? 0,
                            retirada ?? 0,
                        ]}
                        labels={[
                            'Despesas Normais',
                            'Despesas com Pessoal',
                            'Folha de Pagamento',
                            'Fundo Inovação',
                            'Comissão Gestores',
                            'Investimentos',
                            'Retirada',
                        ]}
                        formatBRL={formatBRL}
                    />
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
                    <AnnualAreaChart
                        dados={annualChartData}
                        formatBRL={formatBRL}
                        selectedAnnualType={selectedAnnualType}
                    />
                </div>
            </div>

            <CustomIndexesSection
                section={selectedSection}
                queryMonth={queryMonth}
                queryYear={queryYear}
            />
            <div className={styles.despesasPessoalInfoContainer}>
                <h4 className={styles.despesasPessoalInfoTitle}><UserGroupIcon width={20} height={20} /> Resumo Fechamento</h4>
                <div className={styles.despesasPessoalInfoContent}>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            TOTAL DESPESAS COM PESSOAL
                        </span>
                        <br />
                        {totalDespesasPessoal !== null ? formatBRL(totalDespesasPessoal) : '---'}
                    </div>
                    <RentalFolhaPagamentoItem
                        section={selectedSection}
                        calculoFolhaPagamento={
                            apiData ? despesasPessoalFromHook.folhaPagamentoFinal : null
                        }
                    />
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            COMISSÃO GESTÃO
                        </span>
                        <br />
                        {comissaoGestor !== null ? formatBRL(comissaoGestor) : '---'}
                    </div>
                    <div className={styles.despesasPessoalInfoItem}>
                        <span className={styles.despesasPessoalInfoLabel}>
                            TOTAL DESPESAS COM PESSOAL EXTRAS
                        </span>
                        <br />
                        {totalDespesasPessoalExtras !== null ? formatBRL(totalDespesasPessoalExtras) : '---'}
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
                        {receitaLiquida !== null
                            ? formatBRL(receitaLiquida * 0.05)
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
            <AnnualClosingTable
                section={1}
                annualClosingData={annualClosingData}
                formatBRL={formatBRL}
            />
        </div >
    );

}
