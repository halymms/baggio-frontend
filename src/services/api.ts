import { ApiError, fetchJson, fetchRaw } from '@/lib/apiClient';
import type {
  CashFlowResponse,
  FinancialSection,
  InadimplenciaFechamentosResponse,
  InadimplenciaReferencia,
  InadimplenciaResponse,
  InadimplenciaFechamento,
  InadimplenciaPagosRow,
  InadimplenciaAbertosRow,
  InadimplenciaRow,
  InnovationFund,
  ItemData,
  ManagerCommission,
  MonthlyClosing,
  OpenFinancialStatementPayload,
  RealtimeReportParams,
  RealtimeReportResponse,
} from '@/types/properfy';
import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  User,
} from '@/types/user';

const REALTIME_TIMEOUT_MS = 60_000;

export async function getItemData(
  itemId: number,
  mes: number,
  ano: number
): Promise<ItemData | null> {
  try {
    return await fetchJson<ItemData>(
      `/api/properfy/item-data/${itemId}?mes=${mes}&ano=${ano}`
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function upsertItemData(
  itemId: number,
  planejado: number | null,
  mes: number,
  ano: number,
  method: 'POST' | 'PUT',
  observacao?: string | null
): Promise<Response> {
  const body: Record<string, unknown> = { planejado, mes, ano };
  if (observacao !== undefined) body.observacao = observacao;
  return fetchRaw(`/api/properfy/item-data/${itemId}`, {
    method,
    body: JSON.stringify(body),
  });
}

export async function getMonthlyClosing(
  mes: number,
  ano: number
): Promise<MonthlyClosing | null> {
  try {
    return await fetchJson<MonthlyClosing>(
      `/api/properfy/monthly-closing?mes=${mes}&ano=${ano}`
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return null;
    }
    throw err;
  }
}

export async function upsertMonthlyClosing(data: {
  mes: number;
  ano: number;
  sinais_negocio: number;
  comissoes_receber: number;
  comissoes_receber_prox_mes: number;
  observacao: string;
}): Promise<Response> {
  return fetchRaw('/api/properfy/monthly-closing', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getManagerCommission(
  mes: number,
  ano: number,
  section: FinancialSection = 2
): Promise<ManagerCommission | null> {
  try {
    return await fetchJson<ManagerCommission>(
      `/api/properfy/manager-commission?mes=${mes}&ano=${ano}&section=${section}`
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return null;
    }
    throw err;
  }
}

export async function upsertManagerCommission(data: {
  mes: number;
  ano: number;
  section: FinancialSection;
  comissao_gestor: number;
  observacao?: string;
}): Promise<Response> {
  return fetchRaw('/api/properfy/manager-commission', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getInnovationFund(
  mes: number,
  ano: number
): Promise<InnovationFund | null> {
  try {
    return await fetchJson<InnovationFund>(
      `/api/properfy/innovation-fund?mes=${mes}&ano=${ano}`
    );
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return null;
    }
    throw err;
  }
}

export async function upsertInnovationFund(data: {
  mes: number;
  ano: number;
  fundo_inovacao: number;
  observacao?: string;
}): Promise<Response> {
  return fetchRaw('/api/properfy/innovation-fund', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function openFinancialStatement(
  data: OpenFinancialStatementPayload
): Promise<RealtimeReportResponse> {
  return fetchJson<RealtimeReportResponse>(
    '/api/properfy/open-financial-statement',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function openFinancialStatementDelinquency(
  month: number,
  year: number
): Promise<unknown> {
  return fetchJson<unknown>('/api/properfy/open-financial-statement/delinquency', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  });
}

export async function getInadimplenciaReferencias(): Promise<InadimplenciaReferencia[]> {
  return fetchJson<InadimplenciaReferencia[]>('/api/properfy/inadimplencia/referencias');
}

export async function getInadimplenciaFechamentos(): Promise<InadimplenciaFechamentosResponse> {
  return fetchJson<InadimplenciaFechamentosResponse>('/api/properfy/inadimplencia/fechamentos');
}

export async function getInadimplenciaPagos(params?: {
  mes?: number;
  ano?: number;
  includeItems?: boolean;
}): Promise<{
  filtro: { chrFsStatus: string[] };
  data?: InadimplenciaPagosRow[];
  mes?: number;
  ano?: number;
  label?: string;
  valor_pago_dia_1?: number | null;
  valor_pago_atual?: number | null;
  total?: number | null;
  count?: number | null;
  data?: InadimplenciaRow[];
  [key: string]: unknown;
}> {
  const query = new URLSearchParams();
  if (params?.mes != null) query.set('mes', String(params.mes));
  if (params?.ano != null) query.set('ano', String(params.ano));
  if (params?.includeItems) query.set('include_items', '1');
  const qs = query.toString();
  return fetchJson(`/api/properfy/inadimplencia/pagos${qs ? `?${qs}` : ''}`);
}

export async function getInadimplenciaAbertos(params?: {
  mes?: number;
  ano?: number;
  includeItems?: boolean;
}): Promise<{
  filtro: { chrFsStatus: string[] };
  data?: InadimplenciaAbertosRow[] | InadimplenciaRow[];
  mes?: number;
  ano?: number;
  label?: string;
  valor_aberto_dia_16?: number | null;
  valor_aberto_atual?: number | null;
  valor_aberto_atualizado?: number | null;
  count?: number | null;
  [key: string]: unknown;
}> {
  const query = new URLSearchParams();
  if (params?.mes != null) query.set('mes', String(params.mes));
  if (params?.ano != null) query.set('ano', String(params.ano));
  if (params?.includeItems) query.set('include_items', '1');
  const qs = query.toString();
  return fetchJson(`/api/properfy/inadimplencia/abertos${qs ? `?${qs}` : ''}`);
}

export async function getInadimplenciaData(
  mes: number,
  ano: number
): Promise<InadimplenciaResponse> {
  return fetchJson<InadimplenciaResponse>(
    `/api/properfy/inadimplencia?mes=${mes}&ano=${ano}`
  );
}

export async function syncInadimplenciaReferencia(
  mes: number,
  ano: number
): Promise<{ fechamento: InadimplenciaFechamento | null; detail_count?: number }> {
  return fetchJson('/api/properfy/inadimplencia/sync-referencia', {
    method: 'POST',
    body: JSON.stringify({ mes, ano }),
  });
}

export async function patchInadimplenciaAbertoAtualizado(
  mes: number,
  ano: number,
  valor_aberto_atualizado: number
): Promise<{ fechamento: InadimplenciaFechamento }> {
  return fetchJson('/api/properfy/inadimplencia/aberto-atualizado', {
    method: 'PATCH',
    body: JSON.stringify({ mes, ano, valor_aberto_atualizado }),
  });
}

export async function realtimeReportData(
  params: RealtimeReportParams
): Promise<RealtimeReportResponse> {
  try {
    return await fetchJson<RealtimeReportResponse>(
      '/api/properfy/real-time-report',
      {
        method: 'POST',
        body: JSON.stringify(params),
        timeoutMs: REALTIME_TIMEOUT_MS,
      }
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 408) {
      throw new Error('Timeout ao buscar dados de contas em tempo real');
    }
    throw err;
  }
}

export async function getCashFlow(
  mes: number,
  ano: number
): Promise<CashFlowResponse> {
  return fetchJson<CashFlowResponse>(
    `/api/properfy/cash-flow?mes=${mes}&ano=${ano}`
  );
}

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getUsers(): Promise<User[]> {
  return fetchJson<User[]>('/users', { auth: true });
}

export async function createUser(data: CreateUserRequest): Promise<User> {
  return fetchJson<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export type { FinancialSection };
