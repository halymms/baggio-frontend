"use client";

import {
  UserGroupIcon,
  HomeIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './ui.module.scss';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Financeiro',
    href: '/dashboard/financial',
    icon: ChartBarSquareIcon,
  },
  { name: 'Usuários', href: '/dashboard/users', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={
              pathname === link.href
                ? `${styles.navLink} ${styles.active}`
                : styles.navLink
            }
          >
            <LinkIcon className={styles.icon} />
            <p className={styles.linkText}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
