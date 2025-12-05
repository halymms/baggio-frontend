'use client';

import SideNav from '@/components/ui/SideNav';
import styles from './dashboard.module.scss';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className={styles.homeContainer}>
        <div className={styles.sideNavWrap}>
          <SideNav />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </AuthProvider>
  );
}