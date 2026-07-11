"use client";

import {
  UserGroupIcon,
  HomeIcon,
  ChartBarSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './ui.module.scss';

const baseLinks = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Financeiro',
    href: '/dashboard/financial',
    icon: ChartBarSquareIcon,
    submenu: [
      { name: 'Locação', href: '/dashboard/financial/rentals' },
      { name: 'Vendas', href: '/dashboard/financial/sales' },
      { name: 'Fluxo de Caixa', href: '/dashboard/financial/cash-flow' },
    ]
  },
  { name: 'Usuários', href: '/dashboard/users', icon: UserGroupIcon, adminOnly: true },
];

function isNavLinkActive(
  pathname: string,
  link: { href: string; submenu?: { href: string }[] }
): boolean {
  if (link.submenu?.length) {
    return (
      pathname === link.href ||
      pathname.startsWith(`${link.href}/`) ||
      link.submenu.some(
        (sub) =>
          pathname === sub.href || pathname.startsWith(`${sub.href}/`)
      )
    );
  }

  if (link.href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

export default function NavLinks() {
  const pathname = usePathname();
  const { isAdmin, isHydrated } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'Financeiro': true
  });

  const links = useMemo(() => {
    if (!isHydrated) {
      return baseLinks.filter((link) => !link.adminOnly);
    }
    return baseLinks.filter((link) => !link.adminOnly || isAdmin);
  }, [isAdmin, isHydrated]);

  useEffect(() => {
    const activeParent = links.find(link =>
      link.submenu?.some(sub => pathname === sub.href || pathname.startsWith(sub.href))
    );
    if (activeParent) {
      setOpenSubmenus(prev => ({ ...prev, [activeParent.name]: true }));
    }
  }, [pathname, links]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = isNavLinkActive(pathname, link);
        const hasSubmenu = link.submenu && link.submenu.length > 0;
        const isOpen = openSubmenus[link.name];

        return (
          <div key={link.name}>
            {hasSubmenu ? (
              <div
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={() => toggleSubmenu(link.name)}
                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkIcon className={styles.icon} />
                  <p className={styles.linkText}>{link.name}</p>
                </div>
                {isOpen ? (
                  <ChevronDownIcon style={{ width: 16 }} />
                ) : (
                  <ChevronRightIcon style={{ width: 16 }} />
                )}
              </div>
            ) : (
              <Link
                href={link.href}
                className={
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <LinkIcon className={styles.icon} />
                <p className={styles.linkText}>{link.name}</p>
              </Link>
            )}

            {hasSubmenu && (
              <div className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ''}`}>
                {link.submenu!.map(sub => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className={`${styles.subMenuLink} ${pathname === sub.href ? styles.active : ''}`}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
