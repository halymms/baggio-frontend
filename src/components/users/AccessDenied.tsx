'use client';

import styles from '@/app/dashboard/users/users.module.scss';

export function AccessDenied() {
  return (
    <div className={styles.accessDenied}>
      <h2 className={styles.accessDeniedTitle}>Acesso negado</h2>
      <p className={styles.accessDeniedText}>
        Você não tem permissão para acessar esta área.
      </p>
    </div>
  );
}
