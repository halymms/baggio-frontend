export const FINANCIAL_COMPANY_IDS = [1, 3, 4, 5, 6, 8, 9] as const;

export const FINANCIAL_MONTHS = [
  { value: 0, label: 'Janeiro' },
  { value: 1, label: 'Fevereiro' },
  { value: 2, label: 'Março' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Maio' },
  { value: 5, label: 'Junho' },
  { value: 6, label: 'Julho' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Setembro' },
  { value: 9, label: 'Outubro' },
  { value: 10, label: 'Novembro' },
  { value: 11, label: 'Dezembro' },
] as const;

export const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

const currentYear = new Date().getFullYear();

export const FINANCIAL_YEARS = Array.from(
  { length: currentYear - 2017 },
  (_, i) => 2018 + i
);

export const CASH_FLOW_YEARS = Array.from(
  { length: 4 },
  (_, i) => currentYear - 3 + i
);

export const SECTION_LABELS: Record<1 | 2, { title: string; subtitle: string }> =
  {
    1: {
      title: 'Financeiro - Locação',
      subtitle: 'Visão geral das receitas e despesas de Locação',
    },
    2: {
      title: 'Financeiro - Vendas',
      subtitle: 'Visão geral das receitas e despesas de Vendas',
    },
  };
