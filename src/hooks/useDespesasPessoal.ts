import { useMemo } from "react";

export function useDespesasPessoal(apiData: any) {
  return useMemo(() => {
    if (!apiData) return {
      folhaPagamento: 0,
      outrasDespesasPessoal: 0,
      proLabore: 0,
      salarios: 0,
      gratificacoesPremiacoes: 0,
      totalDespesasPessoalExtras: 0,
      totalDespesasPessoal: 0,
      comissaoFolha: 0,
      folhaPagamentoFinal: 0
    };
    const original = apiData.original || [];
    const getAmount = (idx: string) => {
      const found = original.find((item: any) => item.index === idx);
      return found ? Number(found.amount) : 0;
    };
    const folhaPagamento = getAmount("1.2.2.1");
    const outrasDespesasPessoal = getAmount("1.2.2.2");
    const proLabore = getAmount("1.2.2.1.12");
    const salarios = getAmount("1.2.2.1.14");
    const gratificacoesPremiacoes = getAmount("1.2.2.5");
    const totalDespesasPessoalExtras = (folhaPagamento + outrasDespesasPessoal) - proLabore - salarios;
    const totalDespesasPessoal = folhaPagamento + outrasDespesasPessoal + gratificacoesPremiacoes;
    let comissaoFolha = 0;
    let folhaPagamentoFinal = 0;
    if(totalDespesasPessoal && totalDespesasPessoalExtras && salarios) {
      comissaoFolha = totalDespesasPessoal - totalDespesasPessoalExtras - salarios;
    }
    if(comissaoFolha !== null && salarios) {
      folhaPagamentoFinal = comissaoFolha + salarios;
    }
    return {
      folhaPagamento,
      outrasDespesasPessoal,
      proLabore,
      salarios,
      gratificacoesPremiacoes,
      totalDespesasPessoalExtras,
      totalDespesasPessoal,
      comissaoFolha,
      folhaPagamentoFinal
    };
  }, [apiData]);
}
