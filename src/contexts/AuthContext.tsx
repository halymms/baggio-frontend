'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { setAuthTokenGetter, setOnUnauthorized } from '@/lib/apiClient';
import { getApiErrorMessage } from '@/lib/apiError';
import { decodeJwtPayload, isTokenExpired } from '@/lib/jwt';
import { login as apiLogin } from '@/services/api';
import type { UserRole } from '@/types/user';

const TOKEN_KEY = 'token';
const COOKIE_MAX_AGE = 60 * 60;

function persistToken(token: string | null) {
  if (typeof document === 'undefined') return;
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `token=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}

function extractAuthFromToken(token: string | null): {
  userId: number | null;
  role: UserRole | null;
} {
  if (!token) return { userId: null, role: null };
  const payload = decodeJwtPayload(token);
  if (!payload || isTokenExpired(payload)) {
    return { userId: null, role: null };
  }
  return { userId: payload.id, role: payload.role };
}

interface AuthContextType {
  token: string | null;
  userId: number | null;
  role: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<UserRole | null>;
  logout: () => void;
  getToken: () => string | null;
  clearSessionExpired: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const applyToken = useCallback((nextToken: string | null) => {
    tokenRef.current = nextToken;
    setToken(nextToken);

    if (!nextToken) {
      setUserId(null);
      setRole(null);
      persistToken(null);
      return;
    }

    const payload = decodeJwtPayload(nextToken);
    if (!payload || isTokenExpired(payload)) {
      tokenRef.current = null;
      setToken(null);
      setUserId(null);
      setRole(null);
      persistToken(null);
      return;
    }

    setUserId(payload.id);
    setRole(payload.role);
    persistToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    applyToken(null);
    setError(null);
  }, [applyToken]);

  const handleUnauthorized = useCallback(() => {
    applyToken(null);
    setError(null);
    setSessionExpired(true);
    router.push('/login?expired=1');
  }, [applyToken, router]);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const auth = extractAuthFromToken(stored);
      if (auth.role) {
        applyToken(stored);
      } else {
        persistToken(null);
      }
    }
    setIsHydrated(true);
  }, [applyToken]);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    setOnUnauthorized(handleUnauthorized);
    return () => setOnUnauthorized(null);
  }, [handleUnauthorized]);

  const login = useCallback(
    async (email: string, password: string): Promise<UserRole | null> => {
      try {
        const res = await apiLogin({ email, password });
        applyToken(res.token);
        setError(null);
        setSessionExpired(false);
        const payload = decodeJwtPayload(res.token);
        return payload?.role ?? null;
      } catch (err) {
        setError(
          getApiErrorMessage(err, 'E-mail ou senha inválidos')
        );
        return null;
      }
    },
    [applyToken]
  );

  const getToken = useCallback(() => tokenRef.current, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId,
      role,
      isAdmin: role === 'admin',
      isAuthenticated: Boolean(token),
      isHydrated,
      sessionExpired,
      login,
      logout,
      getToken,
      clearSessionExpired,
      error,
    }),
    [
      token,
      userId,
      role,
      isHydrated,
      sessionExpired,
      login,
      logout,
      getToken,
      clearSessionExpired,
      error,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function getPostLoginPath(role: UserRole | null, from?: string | null) {
  if (from && from.startsWith('/dashboard/users') && role === 'admin') {
    return from;
  }
  if (role === 'admin') return '/dashboard/users';
  return '/dashboard';
}
