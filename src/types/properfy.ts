export type FinancialSection = 1 | 2;

export interface ReportIndexItem {
  id?: number;
  index: string;
  amount: number | string;
  service?: string;
  name?: string;
}

export interface RealtimeReportParams {
  section: FinancialSection | null;
  companies: number[];
  dteRange: [string, string];
}

export interface RealtimeReportResponse {
  receitas?: ReportIndexItem[];
  despesas?: ReportIndexItem[];
  original?: ReportIndexItem[];
}

export interface MonthlyClosing {
  mes?: number;
  ano?: number;
  sinais_negocio?: number | null;
  comissoes_receber?: number | null;
  comissoes_receber_prox_mes?: number | null;
  observacao?: string | null;
}

export interface ManagerCommission {
  comissao_gestor?: number | null;
  observacao?: string | null;
}

export interface InnovationFund {
  fundo_inovacao?: number | null;
  observacao?: string | null;
}

export interface ItemData {
  planejado?: number | null;
  observacao?: string | null;
}

export interface OpenFinancialStatementPayload {
  companies: number[];
  dteRange: [string, string];
  section?: FinancialSection | null;
}

export interface CashFlowPeriodo {
  mes: number;
  ano: number;
  inicio: string;
  fim: string;
}

export interface CashFlowCards {
  totalGeral: number;
  totalEntradas: number;
  totalSaidas: number;
}

export interface CashFlowGraficoDia {
  dia: number;
  data: string;
  valor: number;
}

export interface CashFlowBanco {
  fkWallet: number;
  nome: string;
  totalGeral: number;
}

export interface CashFlowResponse {
  periodo: CashFlowPeriodo;
  cards: CashFlowCards;
  grafico: CashFlowGraficoDia[];
  bancos: CashFlowBanco[];
  avisos: string[];
}
