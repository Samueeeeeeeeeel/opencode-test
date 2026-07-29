'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Panel' },
  { href: '/transactions', label: 'Transacciones' },
  { href: '/accounts', label: 'Cuentas' },
  { href: '/categories', label: 'Categorías' },
  { href: '/budgets', label: 'Presupuestos' },
  { href: '/goals', label: 'Metas' },
  { href: '/debts', label: 'Deudas' },
  { href: '/reports', label: 'Reportes' },
  { href: '/settings', label: 'Configuración' },
];

export function Sidebar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <aside className="hidden w-56 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900 lg:block">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const localizedHref = `/${locale}${item.href}`;
          const isActive = pathname.endsWith(item.href);

          return (
            <Link
              key={item.href}
              href={localizedHref}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
