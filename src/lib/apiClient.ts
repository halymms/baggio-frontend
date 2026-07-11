const DEFAULT_API_URL = 'http://localhost:4000';

let tokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type FetchJsonOptions = RequestInit & {
  timeoutMs?: number;
  token?: string | null;
  auth?: boolean;
};

function resolveToken(
  token: string | null | undefined,
  auth?: boolean
): string | null {
  if (token !== undefined) return token;
  if (auth) return tokenGetter?.() ?? null;
  return null;
}

function handleResponseError(status: number) {
  if (status === 401) {
    onUnauthorized?.();
  }
}

export async function fetchJson<T>(
  path: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { timeoutMs, token, auth, headers, ...init } = options;
  const resolvedToken = resolveToken(token, auth);
  const controller = new AbortController();
  const timeout =
    timeoutMs !== undefined
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
        ...headers,
      },
    });

    if (!res.ok) {
      let body: unknown;
      try {
        const contentType = res.headers.get('content-type');
        body = contentType?.includes('application/json')
          ? await res.json()
          : await res.text();
      } catch {
        body = undefined;
      }
      handleResponseError(res.status);
      throw new ApiError(
        `Erro na requisição (${res.status})`,
        res.status,
        body
      );
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('Tempo limite da requisição excedido', 408);
    }
    throw err;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function fetchRaw(
  path: string,
  options: FetchJsonOptions = {}
): Promise<Response> {
  const { timeoutMs, token, auth, headers, ...init } = options;
  const resolvedToken = resolveToken(token, auth);
  const controller = new AbortController();
  const timeout =
    timeoutMs !== undefined
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
        ...headers,
      },
    });

    if (!res.ok) {
      handleResponseError(res.status);
    }

    return res;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
