"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, getPostLoginPath } from '@/contexts/AuthContext';
import { BaggioLogo } from '@/components/ui/Landing/BaggioLogo';
import styles from './login.module.scss';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isAuthenticated, isHydrated, role, clearSessionExpired } =
    useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const from = searchParams.get('from');
  const expired = searchParams.get('expired') === '1';

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace(getPostLoginPath(role, from));
  }, [isHydrated, isAuthenticated, role, from, router]);

  useEffect(() => {
    if (expired) {
      clearSessionExpired();
    }
  }, [expired, clearSessionExpired]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const loggedRole = await login(email, password);
    setIsLoading(false);
    if (loggedRole) {
      router.push(getPostLoginPath(loggedRole, from));
    }
  };

  if (isHydrated && isAuthenticated) {
    return null;
  }

  return (
    <main className={styles.loginBg}>
      <BaggioLogo width={180} height={60} />
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>Login</h2>
        <p className={styles.loginDescription}>
          Por favor, insira suas credenciais para acessar o sistema.
        </p>
        {expired && (
          <div className={styles.errorMsg}>
            Sessão expirada. Faça login novamente.
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@baggioimoveis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
          {error && <div className={styles.errorMsg}>{error}</div>}
        </form>
      </div>
      <p className={styles.loginFooterText}>
        © 2025 Baggio Imóveis - Sistema Interno
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
