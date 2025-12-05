import { BaggioLogo } from '../ui/Landing/BaggioLogo';
import styles from './footerLanding.module.scss';

export default function FooterLanding() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.logoRow}>
                    <BaggioLogo />
                    <span className={styles.sistemaText}>Sistema Interno</span>
                </div>
                <p className={styles.copyright}>
                    © 2025 Baggio Imóveis - Todos os direitos reservados
                </p>
            </div>
        </footer>
    );
}