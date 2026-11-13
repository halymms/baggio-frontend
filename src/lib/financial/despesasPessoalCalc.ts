import { getAmountFromOriginal } from '@/lib/financial/amounts';
import type { FinancialSection, ReportIndexItem } from '@/types/properfy';

export type DespesasPessoalCalcResult = {
  folhaPagamento: number;
  outrasDespesasPessoal: number;
  proLabore: number;
  salarios: number;
  gratificacoesPremiacoes: number;
  totalDespesasPessoalExtras: number;
  totalDespesasPessoal: number;
  comissaoFolha: number;
  folhaPagamentoFinal: number;
};

export function calcDespesasPessoal(
  original: ReportIndexItem[],
  section: FinancialSection = 1
): DespesasPessoalCalcResult {
  const folhaPagamento = getAmountFromOriginal(original, '1.2.2.1');
  const outrasDespesasPessoal = getAmountFromOriginal(original, '1.2.2.2');
  const proLabore = getAmountFromOriginal(original, '1.2.2.1.12');
  const salarios = getAmountFromOriginal(original, '1.2.2.1.14');
  const gratificacoesPremiacoes = getAmountFromOriginal(original, '1.2.2.5');
  const comissaoLocacaoImoveis = getAmountFromOriginal(original, '1.2.2.3');
  const ajudaDeCusto = getAmountFromOriginal(original, '1.2.2.6');
  const comissaoDecorrenteVendaImoveis = getAmountFromOriginal(original, '1.2.2.4');
  const comissaoVendaEfetuada = getAmountFromOriginal(original, '1.2.2.4.4');

  const totalDespesasPessoalExtras =
    Math.abs(folhaPagamento) +
    Math.abs(outrasDespesasPessoal) -
    Math.abs(proLabore) -
    Math.abs(salarios);

  const totalDespesasPessoal =
    section === 1
      ? Math.abs(folhaPagamento) +
        Math.abs(outrasDespesasPessoal) +
        Math.abs(gratificacoesPremiacoes) +
        Math.abs(comissaoLocacaoImoveis) +
        Math.abs(ajudaDeCusto) -
        Math.abs(proLabore)
      : Math.abs(folhaPagamento) +
        Math.abs(outrasDespesasPessoal) +
        Math.abs(comissaoDecorrenteVendaImoveis) +
        Math.abs(comissaoLocacaoImoveis) +
        Math.abs(gratificacoesPremiacoes) -
        Math.abs(proLabore) -
        Math.abs(comissaoVendaEfetuada);

  const comissaoFolha =
    Math.abs(totalDespesasPessoal) -
    Math.abs(totalDespesasPessoalExtras) -
    Math.abs(salarios);

  const folhaPagamentoFinal = Math.abs(comissaoFolha) + Math.abs(salarios);

  return {
    folhaPagamento,
    outrasDespesasPessoal,
    proLabore,
    salarios,
    gratificacoesPremiacoes,
    totalDespesasPessoalExtras,
    totalDespesasPessoal,
    comissaoFolha,
    folhaPagamentoFinal,
  };
}
