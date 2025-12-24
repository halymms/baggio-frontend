const API_URL = 'http://localhost:4000';

// Buscar dados de um item para um mês/ano (inclui observacao)
export async function getItemData(itemId: number, mes: number, ano: number) {
  const res = await fetch(`${API_URL}/api/properfy/item-data/${itemId}?mes=${mes}&ano=${ano}`);
  if (!res.ok) return null;
  return res.json(); // retorna { planejado, observacao, ... }
}

// Cadastrar/editar dados de um item para um mês/ano (inclui observacao)

export async function upsertItemData(
  itemId: number,
  planejado: number | null,
  mes: number,
  ano: number,
  method: 'POST' | 'PUT',
  observacao?: string | null
) {
  const body: any = { planejado, mes, ano };
  if (observacao !== undefined) body.observacao = observacao;
  const res = await fetch(`${API_URL}/api/properfy/item-data/${itemId}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res;
}

// Buscar dados do fechamento mensal
export async function getMonthlyClosing(mes: number, ano: number) {
  const res = await fetch(`${API_URL}/api/properfy/monthly-closing?mes=${mes}&ano=${ano}`);
  if (!res.ok) return null;
  return res.json();
}

// Cadastrar/atualizar dados do fechamento mensal
export async function upsertMonthlyClosing(data: {
  mes: number;
  ano: number;
  sinais_negocio: number;
  comissoes_receber: number;
  comissoes_receber_prox_mes: number;
  observacao: string;
}) {
  const res = await fetch(`${API_URL}/api/properfy/monthly-closing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res;
}

export async function openFinancialStatement(data: any) {
  const res = await fetch(`${API_URL}/api/properfy/open-financial-statement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao buscar extrato financeiro');
  return res.json();
}

export async function realtimeReportData(params: any) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 segundos

  try {
    const res = await fetch(`${API_URL}/api/properfy/real-time-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Erro ao buscar dados de contas em tempo real');
    return await res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('Timeout!');
      throw new Error('Timeout ao buscar dados de contas em tempo real');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login inválido');
  return res.json();
}

export async function getUsers(token: string) {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Não autorizado');
  return res.json();
}