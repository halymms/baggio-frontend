'use client';
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { realtimeReportData } from "@/services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import {
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BanknotesIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarSquareIcon,
  InformationCircleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import styles from './financial.module.scss';

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

export default function Page() {
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
    resultadoLiquido: number | null,
    folhaPagamento: number | null,
    investimentos: number | null,
    impostos: number | null,
    totalDespesas: number | null,
    lucroLiquido: number | null,
    retirada: number | null
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
      'Fundo de Inovação 5%': row.fundoDeReserva ?? '',
      'Fundo de Reserva 5%': row.fundoDeReserva ?? '',
      'Resultado Líquido': row.resultadoLiquido ?? '',
      'Folha de Pagamento': row.folhaPagamento ?? '',
      'Investimentos': row.investimentos ?? '',
      'Impostos': row.impostos ?? '',
      'Despesas': row.totalDespesas ?? '',
      'Lucro Líquido': row.lucroLiquido ?? '',
      'Comissão Gestores': '',
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
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [totalDespesasPessoalExtras, setTotalDespesasPessoalExtras] = useState<number | null>(null);
  const [totalDespesasPessoal, setTotalDespesasPessoal] = useState<number | null>(null);
  const [comissaoFolha, setComissaoFolha] = useState<number | null>(null);
  const [fundoDeReserva, setFundoDeReserva] = useState<number | null>(null);
  const [folhaPagamento, setFolhaPagamento] = useState<number | null>(null);
  const [despesasNormais, setDespesasNormais] = useState<number | null>(null);
  const [investimentos, setInvestimentos] = useState<number | null>(null);
  const [receitaBruta, setReceitaBruta] = useState<number | null>(null);
  const [receitaLiquida, setReceitaLiquida] = useState<number | null>(null);
  const [resultadoLiquido, setResultadoLiquido] = useState<number | null>(null);
  const [lucroLiquido, setLucroLiquido] = useState<number | null>(null);

  const [impostos, setImpostos] = useState<number | null>(null);
  const [totalDespesas, setTotalDespesas] = useState<number | null>(null);
  const [retirada, setRetirada] = useState<number | null>(null);
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
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
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
        console.log("Dados de contas em tempo real:", res);
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
        const prejuizoDecorrenteAdmImoveis = getAmount("1.2.8.1");
        const bens = getAmount("1.2.9.2");
        const direitos = getAmount("1.2.9");
        const investimentos = getAmount("1.2.9.4");
        let folhaPagamentoFinal = folhaPagamento;
        const despesasNormaisCalc = (
          despesasGerais
          + telefones +
          entidadesDeClasses +
          materiais +
          propagandaPublicidadeInstitucional +
          propagandaPublicidadeProduto +
          despesasComVeiculos +
          seguros +
          assessorias +
          servicos +
          manutencoes +
          copaCozinha +
          comemoracoes +
          viagens +
          locacaoMaquinasEquipamentos +
          tarifasBancarias +
          tarifaCartaoCredito +
          impostosFederais +
          impostosMunicipais +
          prejuizoDecorrenteAdmImoveis +
          bens +
          direitos
        );
        setDespesasNormais(despesasNormaisCalc);
        setReceitaBruta(receita?.amount ?? 0);
        setTotalDespesas(despesa?.amount ?? 0);
        setImpostos(impostosFederais + impostosMunicipais);
        setInvestimentos(investimentos);
        const totalDespesasPessoalExtrasCalc = (folhaPagamento + outrasDespesasPessoal) - proLabore - salarios;
        setTotalDespesasPessoalExtras(totalDespesasPessoalExtrasCalc);
        const totalDespesasPessoalCalc = folhaPagamento + outrasDespesasPessoal + gratificacoesPremiacoes + comissaoLocacaoImoveis + ajudaDeCusto;
        setTotalDespesasPessoal(totalDespesasPessoalCalc);

        let comissaoFolhaCalc = 0;
        if (totalDespesasPessoalCalc && totalDespesasPessoalExtrasCalc && salarios) {
          comissaoFolhaCalc = totalDespesasPessoalCalc - totalDespesasPessoalExtrasCalc - salarios;
          setComissaoFolha(comissaoFolhaCalc);
        }
        let folhaPagamentoFinalCalc = salarios;
        if (comissaoFolhaCalc && salarios) {
          folhaPagamentoFinalCalc = comissaoFolhaCalc + salarios;
        }
        setFolhaPagamento(folhaPagamentoFinalCalc);

        let receitaLiquidaCalc = 0;
        if (totalDespesasPessoalExtrasCalc && despesasNormaisCalc) {
          receitaLiquidaCalc = (receita?.amount ?? 0) - totalDespesasPessoalExtrasCalc - despesasNormaisCalc;
          setReceitaLiquida(receitaLiquidaCalc);
        }
        if (receitaLiquida && folhaPagamentoFinal && investimentos) {
          setRetirada(receitaLiquidaCalc - folhaPagamentoFinalCalc - investimentos);
        }
        if (receitaLiquida) {
          setFundoDeReserva(receitaLiquida * 0.05);
        }
        if (receitaLiquida && fundoDeReserva) {
          const resultadoLiquidoCalc = receitaLiquida - fundoDeReserva - fundoDeReserva;
          setResultadoLiquido(resultadoLiquidoCalc);
        }
        if (resultadoLiquido) {
          const lucroLiquidoCalc = resultadoLiquido - folhaPagamento - investimentos;
          setLucroLiquido(lucroLiquidoCalc);
        }
      })
      .catch((err) => {
        setTotalDespesasPessoalExtras(null);
        setTotalDespesasPessoal(null);
        setComissaoFolha(null);
        console.error("Erro ao buscar contas em tempo real:", err);
      });
  }, [selectedMonth, selectedYear, selectedSection, totalDespesasPessoal, totalDespesasPessoalExtras]);

  useEffect(() => {
    const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    async function fetchMonthsSequentially() {
      const results = [];
      for (const m of months) {
        const startDate = new Date(selectedYear, m.value, 1);
        const endDate = new Date(selectedYear, m.value + 1, 0);
        const body = {
          section: selectedSection,
          companies: [1, 3, 4, 5, 6, 8, 9],
          dteRange: [
            startDate.toISOString(),
            endDate.toISOString()
          ]
        };
        try {
          const res = await realtimeReportData(body);
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
          const prejuizoDecorrenteAdmImoveis = getAmount("1.2.8.1");
          const bens = getAmount("1.2.9.2");
          const direitos = getAmount("1.2.9");
          const investimentos = getAmount("1.2.9.4");
          const despesasNormais =
            despesasGerais + telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + copaCozinha + comemoracoes + viagens + locacaoMaquinasEquipamentos + tarifasBancarias + tarifaCartaoCredito + impostosFederais + impostosMunicipais + prejuizoDecorrenteAdmImoveis + bens + direitos;
          const receitaBruta = receita?.amount ?? null;
          const totalDespesas = despesa?.amount ?? null;
          const impostos = impostosFederais + impostosMunicipais;
          const totalDespesasPessoalExtras = (folhaPagamento + outrasDespesasPessoal) - proLabore - salarios;
          const totalDespesasPessoal = folhaPagamento + outrasDespesasPessoal + gratificacoesPremiacoes + comissaoLocacaoImoveis + ajudaDeCusto;
          let comissaoFolha = null;
          if (totalDespesasPessoal && totalDespesasPessoalExtras && salarios) {
            comissaoFolha = totalDespesasPessoal - totalDespesasPessoalExtras - salarios;
          }
          let folhaPagamentoFinal = folhaPagamento;
          if (comissaoFolha && salarios) {
            folhaPagamentoFinal = comissaoFolha + salarios;
          }
          let receitaLiquida = null;
          if (totalDespesasPessoalExtras && despesasNormais) {
            receitaLiquida = (receita?.amount ?? 0) - totalDespesasPessoalExtras - despesasNormais;
          }
          let fundoDeReserva = null;
          if (receitaLiquida) {
            fundoDeReserva = receitaLiquida * 0.05;
          }
          let resultadoLiquido = null;
          if (receitaLiquida && fundoDeReserva) {
            resultadoLiquido = receitaLiquida - fundoDeReserva - fundoDeReserva;
          }
          let lucroLiquido = null;
          if (resultadoLiquido) {
            lucroLiquido = resultadoLiquido - folhaPagamentoFinal - investimentos;
          }
          let retirada = null;
          if (receitaLiquida && folhaPagamentoFinal && investimentos) {
            retirada = receitaLiquida - folhaPagamentoFinal - investimentos;
          }
          results.push({
            month: monthAbbr[m.value],
            receitaBruta,
            totalDespesasPessoal,
            despesasNormais,
            receitaLiquida,
            fundoDeReserva,
            resultadoLiquido,
            folhaPagamento: folhaPagamentoFinal,
            investimentos,
            impostos,
            totalDespesas,
            lucroLiquido,
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
            resultadoLiquido: null,
            folhaPagamento: null,
            investimentos: null,
            impostos: null,
            totalDespesas: null,
            lucroLiquido: null,
            retirada: null
          });
        }
      }
      setAnnualClosingData(results);
    }
    fetchMonthsSequentially();
  }, [selectedYear, selectedSection]);

  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedAnnualMonth + 1, 0).getDate();
    const promises = Array.from({ length: daysInMonth }, (_, i) => {
      const startDate = new Date(selectedYear, selectedAnnualMonth, i + 1);
      const endDate = new Date(selectedYear, selectedAnnualMonth, i + 1);
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
  }, [selectedYear, selectedSection, selectedAnnualMonth]);

  // Buscar dados mensais para o gráfico anual
  useEffect(() => {
    const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const promises = months.map((m) => {
      const startDate = new Date(selectedYear, m.value, 1);
      const endDate = new Date(selectedYear, m.value + 1, 0);
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
      }).catch(() => ({ month: `${monthAbbr[m.value]}/${selectedYear}`, value: 0 }));
    });
    Promise.all(promises).then(setAnnualChartData);
  }, [selectedYear, selectedSection, selectedAnnualType]);

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
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);
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
        console.log("Mapped Values:", values);
        if (true) { // values.every(v => v.amount !== null)) {
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
  }, [customIndexes, selectedMonth, selectedYear, selectedSection]);

  return (
    <div className={styles.financialPageContainer}>
      <div className={styles.financialPageHeader}>
        <h1 className={styles.financialPageTitle}>Módulo Financeiro</h1>
        <p className={styles.financialPageSubtitle}>Visão geral das receitas e despesas</p>
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
          <div className={styles.financialPageSelectContent}>
            <select className={`${styles.financialPageSelect} ${styles.financialPageSelectSection}`} value={selectedSection} onChange={e => setSelectedSection(Number(e.target.value))}>
              <option value={1}>Locação</option>
              <option value={2}>Vendas</option>
            </select>
          </div>
        </div>
        <Link className={styles.financialPageLink} href={`/dashboard/financial/reports?month=${selectedMonth}&year=${selectedYear}&section=${selectedSection}`}>
          <DocumentTextIcon width={24} height={24} /> Fechamento
        </Link>
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
            {totalDespesas !== null ? formatBRL(totalDespesas) : '---'}
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
      </div>
      <div className={styles.graphicsContainer}>
        <div className={styles.despesasCharts}>
          <h2 className={styles.chartTitle}>Composição das Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { value: folhaPagamento !== null ? folhaPagamento : 0, absValue: Math.abs(folhaPagamento ?? 0), name: 'Folha de Pagamento' },
                  { value: comissaoFolha !== null ? comissaoFolha : 0, absValue: Math.abs(comissaoFolha ?? 0), name: 'Comissão Folha' },
                  { value: totalDespesasPessoal !== null ? totalDespesasPessoal : 0, absValue: Math.abs(totalDespesasPessoal ?? 0), name: 'Despesas com Pessoal' },
                  { value: totalDespesasPessoalExtras !== null ? totalDespesasPessoalExtras : 0, absValue: Math.abs(totalDespesasPessoalExtras ?? 0), name: 'Despesas com Pessoal Extra' },
                  { value: despesasNormais !== null ? despesasNormais : 0, absValue: Math.abs(despesasNormais ?? 0), name: 'Despesas Normais' },
                  { value: investimentos !== null ? investimentos : 0, absValue: Math.abs(investimentos ?? 0), name: 'Investimentos' }
                ]}
                dataKey="absValue"
                nameKey="name"
                cx="50%"
                cy="50%"
                fill="#1e3a5f"
                isAnimationActive={true}
                outerRadius={100}
                label={({
                  x,
                  y,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  index,
                  value
                }: any) => {
                  return (
                    <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                      {`${formatBRL(value)} (${(percent * 100).toFixed(2)}%)`}
                    </text>
                  );
                }}
              >
                {[
                  folhaPagamento !== null ? folhaPagamento : 0,
                  comissaoFolha !== null ? comissaoFolha : 0,
                  totalDespesasPessoal !== null ? totalDespesasPessoal : 0,
                  totalDespesasPessoalExtras !== null ? totalDespesasPessoalExtras : 0,
                  despesasNormais !== null ? despesasNormais : 0,
                  investimentos !== null ? investimentos : 0
                ].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#aaa'][index % 7]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [formatBRL(props.payload.value), name]} />
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
              TOTAL DESPESAS COM PESSOAL
            </span>
            <br />
            {totalDespesasPessoal !== null ? formatBRL(totalDespesasPessoal) : '---'}
          </div>
          <div className={styles.despesasPessoalInfoItem}>
            <span className={styles.despesasPessoalInfoLabel}>
              FOLHA DE PAGAMENTO
            </span>
            <br />
            {folhaPagamento !== null ? formatBRL(folhaPagamento) : '---'}
          </div>
          <div className={styles.despesasPessoalInfoItem}>
            <span className={styles.despesasPessoalInfoLabel}>
              COMISSÃO FOLHA
            </span>
            <br />
            {comissaoFolha !== null ? formatBRL(comissaoFolha) : '---'}
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
              FUNDO DE RESERVA
            </span>
            <br />
            {receitaLiquida !== null && totalDespesas !== null
              ? formatBRL((receitaLiquida * 0.5) / 100)
              : '---'}
          </p>
          <div className={styles.despesasNormaisInfoIcon}>
            <BanknotesIcon width={24} height={24} color="#155dfc" />
          </div>
        </div>
      </div>
      <div className={styles.annualClosingDataContainer}>
        <div className={styles.annualClosingDataTitle}>
          <h4 className={styles.annualClosingDataTitleText}><BriefcaseIcon width={20} height={20} /> Dados do Fechamento Anual</h4>
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
                    <td>{row.fundoDeReserva !== null ? formatBRL(row.fundoDeReserva) : '---'}</td>
                    <td>{row.fundoDeReserva !== null ? formatBRL(row.fundoDeReserva) : '---'}</td>
                    <td>{row.resultadoLiquido !== null ? formatBRL(row.resultadoLiquido) : '---'}</td>
                    <td>{row.folhaPagamento !== null ? formatBRL(row.folhaPagamento) : '---'}</td>
                    <td>{row.investimentos !== null ? formatBRL(row.investimentos) : '---'}</td>
                    <td>{row.impostos !== null ? formatBRL(row.impostos) : '---'}</td>
                    <td>{row.totalDespesas !== null ? formatBRL(row.totalDespesas) : '---'}</td>
                    <td>{row.lucroLiquido !== null ? formatBRL(row.lucroLiquido) : '---'}</td>
                    <td>---</td>
                    <td>{row.retirada !== null ? formatBRL(row.retirada) : '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}