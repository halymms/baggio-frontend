'use client';

import SideNav from '@/components/ui/SideNav';
import styles from './dashboard.module.scss';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.sideNavWrap}>
        <SideNav />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}