"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { BaggioLogo } from '@/components/ui/Landing/BaggioLogo';
import styles from './login.module.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <main className={styles.loginBg}>
      <BaggioLogo 
        width={180}
        height={60}
      />
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>Login</h2>
        <p className={styles.loginDescription}>Por favor, insira suas credenciais para acessar o sistema.</p>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>E-mail</label>
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
            <label htmlFor="password" className={styles.formLabel}>Senha</label>
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
      <p className={styles.loginFooterText}>© 2025 Baggio Imóveis - Sistema Interno</p>
    </main>
  );
}