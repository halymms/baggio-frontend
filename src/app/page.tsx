import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import HeaderLanding from "@/components/Landing/HeaderLanding";
import FooterLanding from "@/components/Landing/FooterLanding";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <>
      <HeaderLanding />
        <main className={styles.landingMain}>
          <div className={styles.landingContent}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <div className={styles.logoCircle}>
                <BarChart3 className={styles.logoIcon} />
              </div>
              <h1 className={styles.landingTitle}>
                Bem-vindo ao Sistema de Análise
              </h1>
              <p className={styles.landingDescription}>
                Acesse insights detalhados sobre o desempenho da Baggio Imóveis através de relatórios e dashboards interativos.
              </p>
              <Link href={"/login"} className={styles.loginBtn}>
                Acessar Sistema <ArrowRight className={styles.arrowIcon} />
              </Link>
            </div>
          </div>
        </main>
      <FooterLanding />
    </>
  );
}
