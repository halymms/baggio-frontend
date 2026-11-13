import { ApiError } from '@/lib/apiClient';
import type { ApiErrorBody } from '@/types/user';

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha inválidos',
  'Email and password are required': 'E-mail e senha são obrigatórios',
  'Name, email and password are required':
    'Nome, e-mail e senha são obrigatórios',
  'Invalid role': 'Perfil inválido',
  'Email já cadastrado': 'E-mail já cadastrado',
  'Token não fornecido': 'Sessão expirada',
  'Token inválido': 'Sessão expirada',
};

export function getApiErrorBody(err: unknown): ApiErrorBody | null {
  if (!(err instanceof ApiError)) return null;
  if (
    err.body &&
    typeof err.body === 'object' &&
    'error' in err.body &&
    typeof (err.body as ApiErrorBody).error === 'string'
  ) {
    return err.body as ApiErrorBody;
  }
  return null;
}

export function translateApiError(message: string): string {
  return ERROR_TRANSLATIONS[message] ?? message;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const body = getApiErrorBody(err);
  if (body) return translateApiError(body.error);
  return fallback;
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export function isForbiddenError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403;
}

export function isConflictError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}
