"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDenied } from '@/components/users/AccessDenied';
import { UsersTable } from '@/components/users/UsersTable';
import { useUsers } from '@/hooks/useUsers';
import styles from '@/app/dashboard/users/users.module.scss';

function UsersListInner() {
  const searchParams = useSearchParams();
  const created = searchParams.get('created') === '1';
  const { isAdmin, isHydrated } = useAuth();
  const { users, loading, error, refetch } = useUsers(isHydrated && isAdmin);

  useEffect(() => {
    if (!created) return;
    window.history.replaceState({}, '', '/dashboard/users');
  }, [created]);

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

  return (
    <div className={styles.usersPageContainer}>
      <header className={styles.usersPageHeader}>
        <div>
          <h1 className={styles.usersPageTitle}>Usuários</h1>
          <p className={styles.usersPageSubtitle}>
            Gerencie as contas de acesso ao sistema
          </p>
        </div>
        <Link href="/dashboard/users/new" className={styles.primaryButton}>
          Novo usuário
        </Link>
      </header>

      {created && (
        <p className={styles.success}>Usuário criado com sucesso.</p>
      )}

      <div className={styles.card}>
        {(loading || error) && (
          <div className={styles.statusWrap}>
            {loading && <p className={styles.loading}>Carregando usuários...</p>}
            {error && (
              <div>
                <p className={styles.error}>{error}</p>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={refetch}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && <UsersTable users={users} />}
      </div>
    </div>
  );
}

export function UsersListContent() {
  return (
    <Suspense fallback={
      <div className={styles.usersPageContainer}>
        <p className={styles.loading}>Carregando...</p>
      </div>
    }>
      <UsersListInner />
    </Suspense>
  );
}
