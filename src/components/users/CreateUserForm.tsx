'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDenied } from '@/components/users/AccessDenied';
import { createUser } from '@/services/api';
import {
  getApiErrorMessage,
  isConflictError,
  isForbiddenError,
  isUnauthorizedError,
} from '@/lib/apiError';
import type { UserRole } from '@/types/user';
import styles from '@/app/dashboard/users/users.module.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateUserForm() {
  const router = useRouter();
  const { isAdmin, isHydrated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isHydrated) {
    return (
      <div className={styles.usersPageContainer}>
        <p className={styles.loading}>Carregando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.usersPageContainer}>
        <AccessDenied />
      </div>
    );
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Nome é obrigatório';
    if (!email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'E-mail inválido';
    }
    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push('/dashboard/users?created=1');
    } catch (err) {
      if (isUnauthorizedError(err)) return;
      if (isForbiddenError(err)) {
        setFormError('Sem permissão para criar usuários');
        return;
      }
      if (isConflictError(err)) {
        setFieldErrors({ email: 'E-mail já cadastrado' });
        return;
      }
      setFormError(
        getApiErrorMessage(err, 'Erro interno. Tente novamente.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.usersPageContainer}>
      <header className={styles.usersPageHeader}>
        <div>
          <h1 className={styles.usersPageTitle}>Novo usuário</h1>
          <p className={styles.usersPageSubtitle}>
            Preencha os dados para criar uma nova conta
          </p>
        </div>
      </header>

      <div className={`${styles.card} ${styles.formPage}`}>
        {formError && <p className={styles.formError}>{formError}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.formInput}
              disabled={isSubmitting}
            />
            {fieldErrors.name && (
              <span className={styles.fieldError}>{fieldErrors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formInput}
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
              disabled={isSubmitting}
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.formLabel}>
              Perfil
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={styles.formSelect}
              disabled={isSubmitting}
            >
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
            <Link href="/dashboard/users" className={styles.secondaryButton}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
