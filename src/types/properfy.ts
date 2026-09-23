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
  mes?: number;
  ano?: number;
  section?: FinancialSection;
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
  fkRenter?: number;
  chrType?: string[];
  chrStatus?: string[];
  chrFinancialStatus?: string[];
  chrFsStatus?: string[];
  chrChargeMethod?: string[];
  fkBankAccount?: number;
  chrInsurance?: string[];
  dteDue?: [string, string] | string[];
  dteDueOwner?: string[];
  dteSolved?: string[];
  dteSolvedOwner?: string[];
  chrAssurance?: string[];
  chrOrder?: string;
  page?: number;
  size?: number;
  companies?: number[];
  dteRange?: [string, string];
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

export interface InadimplenciaReferencia {
  mes: number;
  ano: number;
  label: string;
  total?: number;
  synced_at?: string | null;
}

export interface InadimplenciaRow {
  id?: number;
  fs_id: number;
  mes_referencia: number;
  ano_referencia: number;
  dte_reference: string;
  dte_due: string | null;
  chr_status: string | null;
  status_fs: string | null;
  dcm_amount: number | string | null;
  fk_contract: number | null;
  status: string | null;
  status_fin: string | null;
  chr_identifier: string | null;
  renter_name: string | null;
  renter_email: string | null;
  renter_phone: string | null;
  chr_bank: string | null;
  bank_slip: string | null;
  synced_at?: string | null;
}

export interface InadimplenciaFechamento {
  id?: number;
  mes_referencia: number;
  ano_referencia: number;
  dte_reference: string;
  valor_pago_dia_1: number | null;
  valor_aberto_dia_16: number | null;
  valor_aberto_atualizado: number | null;
  valor_pago_atual: number | null;
  valor_aberto_atual: number | null;
  pago_dia_1_captured_at?: string | null;
  aberto_dia_16_captured_at?: string | null;
  aberto_atualizado_at?: string | null;
  synced_at?: string | null;
  total_gerado_fechamento?: number | null;
  total_gerado_atual?: number | null;
  inadimplencia_fechamento_pct?: number | null;
  inadimplencia_atual_pct?: number | null;
  inadimplencia_acumulada_atualizada_pct?: number | null;
}

export interface InadimplenciaAcumulado12Meses {
  from: { mes: number; ano: number };
  to: { mes: number; ano: number };
  months_included: number;
  referencias: Array<{ mes: number; ano: number; label: string }>;
  total_aberto: number;
  total_gerado: number;
  percentual: number | null;
}

export interface InadimplenciaFechamentosResponse {
  data: InadimplenciaFechamento[];
  acumulado_12_meses: InadimplenciaAcumulado12Meses;
  window: {
    from: { mes: number; ano: number };
    to: { mes: number; ano: number };
  };
}

export interface InadimplenciaPagosRow {
  mes_referencia: number;
  ano_referencia: number;
  dte_reference: string;
  valor_pago_dia_1: number | null;
  valor_pago_atual: number | null;
  pago_dia_1_captured_at?: string | null;
  synced_at?: string | null;
  chrFsStatus?: string[];
}

export interface InadimplenciaAbertosRow {
  mes_referencia: number;
  ano_referencia: number;
  dte_reference: string;
  valor_aberto_dia_16: number | null;
  valor_aberto_atual: number | null;
  valor_aberto_atualizado: number | null;
  aberto_dia_16_captured_at?: string | null;
  aberto_atualizado_at?: string | null;
  synced_at?: string | null;
  inadimplencia_fechamento_pct?: number | null;
  inadimplencia_atual_pct?: number | null;
  inadimplencia_acumulada_atualizada_pct?: number | null;
  chrFsStatus?: string[];
}

export interface InadimplenciaResponse {
  mes: number;
  ano: number;
  label: string;
  synced_at: string | null;
  fechamento?: InadimplenciaFechamento | null;
  data: InadimplenciaRow[];
}
