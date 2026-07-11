import { ApiError, fetchJson, fetchRaw } from '@/lib/apiClient';
import type {
  CashFlowResponse,
  FinancialSection,
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
  ano: number
): Promise<ManagerCommission | null> {
  try {
    return await fetchJson<ManagerCommission>(
      `/api/properfy/manager-commission?mes=${mes}&ano=${ano}`
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
