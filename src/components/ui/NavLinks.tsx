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
import { useState, useEffect } from 'react';
import styles from './ui.module.scss';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Financeiro',
    href: '/dashboard/financial', // Default link, might redirect or show overview
    icon: ChartBarSquareIcon,
    submenu: [
      { name: 'Locação', href: '/dashboard/financial/rentals' },
      { name: 'Vendas', href: '/dashboard/financial/sales' },
    ]
  },
  { name: 'Usuários', href: '/dashboard/users', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'Financeiro': true // Default open or closed? Maybe open if active.
  });

  useEffect(() => {
    // Open submenu if current path is within it
    const activeParent = links.find(link =>
      link.submenu?.some(sub => pathname === sub.href || pathname.startsWith(sub.href))
    );
    if (activeParent) {
      setOpenSubmenus(prev => ({ ...prev, [activeParent.name]: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href || (link.submenu && link.submenu.some(sub => pathname === sub.href));
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
                  pathname === link.href
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
