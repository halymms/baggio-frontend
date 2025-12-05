import { useMemo } from "react";

export function useDespesasNormais(apiData: any) {
  return useMemo(() => {
    if (!apiData) return 0;
    const original = apiData.original || [];
    const getAmount = (idx: string) => {
      const found = original.find((item: any) => item.index === idx);
      return found ? Number(found.amount) : 0;
    };
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
    return despesasGerais + telefones + entidadesDeClasses + materiais + propagandaPublicidadeInstitucional + propagandaPublicidadeProduto + despesasComVeiculos + seguros + assessorias + servicos + manutencoes + copaCozinha + comemoracoes + viagens + locacaoMaquinasEquipamentos + tarifasBancarias + tarifaCartaoCredito + impostosFederais + impostosMunicipais + prejuizoDecorrenteAdmImoveis + bens + direitos;
  }, [apiData]);
}
