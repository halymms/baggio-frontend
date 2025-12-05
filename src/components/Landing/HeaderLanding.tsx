import React from 'react';
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { BaggioLogo } from '../ui/Landing/BaggioLogo';
import styles from './headerLanding.module.scss';

export default function HeaderLanding() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoRow}>
          <BaggioLogo />
          <div className={styles.divider}></div>
          <span className={styles.sistemaText}>Sistema de Análise de Dados</span>
        </div>
        <Link href="/login" className={styles.loginBtn}>
          Acessar Sistema
          <ArrowRight className={styles.arrowIcon} />
        </Link>
      </div>
    </header>
  );
}
