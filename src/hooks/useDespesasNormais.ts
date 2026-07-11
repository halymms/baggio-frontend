import { useMemo } from 'react';
import { getAmountFromOriginal } from '@/lib/financial/amounts';
import type { RealtimeReportResponse } from '@/types/properfy';

export function useDespesasNormais(apiData: RealtimeReportResponse | null) {
  return useMemo(() => {
    if (!apiData?.original) return 0;
    const original = apiData.original;
    const despesasGerais = getAmountFromOriginal(original, '1.2.1.1');
    const telefones = getAmountFromOriginal(original, '1.2.1.2');
    const entidadesDeClasses = getAmountFromOriginal(original, '1.2.1.3');
    const materiais = getAmountFromOriginal(original, '1.2.1.4');
    const propagandaPublicidadeInstitucional = getAmountFromOriginal(
      original,
      '1.2.1.5'
    );
    const propagandaPublicidadeProduto = getAmountFromOriginal(original, '1.2.1.6');
    const despesasComVeiculos = getAmountFromOriginal(original, '1.2.1.7');
    const seguros = getAmountFromOriginal(original, '1.2.1.8');
    const assessorias = getAmountFromOriginal(original, '1.2.1.9');
    const servicos = getAmountFromOriginal(original, '1.2.1.10');
    const manutencoes = getAmountFromOriginal(original, '1.2.1.11');
    const copaCozinha = getAmountFromOriginal(original, '1.2.1.13');
    const comemoracoes = getAmountFromOriginal(original, '1.2.1.14');
    const viagens = getAmountFromOriginal(original, '1.2.1.16');
    const locacaoMaquinasEquipamentos = getAmountFromOriginal(original, '1.2.9.2.3');
    const tarifasBancarias = getAmountFromOriginal(original, '1.2.3.1');
    const tarifaCartaoCredito = getAmountFromOriginal(original, '1.2.3.3');
    const impostosFederais = getAmountFromOriginal(original, '1.2.4.1');
    const impostosMunicipais = getAmountFromOriginal(original, '1.2.4.2');
    const prejuizoDecorrenteAdmImoveis = getAmountFromOriginal(original, '1.2.8.1');
    const bens = getAmountFromOriginal(original, '1.2.9.2');
    const direitos = getAmountFromOriginal(original, '1.2.9');
    return (
      despesasGerais +
      telefones +
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
  }, [apiData]);
}
