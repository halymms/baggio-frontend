"use client";
import styles from './ui.module.scss';
import Link from 'next/link';
import NavLinks from './NavLinks';
import { PowerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function SideNav() {
  const { logout } = useAuth() ?? {};
  const router = useRouter();

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    logout();
    router.push('/');
  };

  return (
    <div className={styles.sidenav}>
      <Link className={styles.logoLink} href="/dashboard">
        <div className={styles.logoWrap}>
          <Image src="/baggioLogoBranca.png" alt="Logo" objectFit="contain" width={128} height={40}/>
        </div>
      </Link>
      <div className={styles.navContent}>
        <NavLinks />
        <div className={styles.spacer}></div>
        <form onSubmit={handleLogout}>
          <button className={styles.signOutBtn} type="submit">
            <PowerIcon className={styles.icon} />
            <div className={`${styles.signOutText} ${poppins.className}`}>Sair</div>
          </button>
        </form>
      </div>
    </div>
  );
}
