'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Panel' },
  { href: '/transactions', label: 'Movimientos' },
  { href: '/budgets', label: 'Presupuestos' },
  { href: '/goals', label: 'Metas' },
  { href: '/reports', label: 'Reportes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  return (
    <aside className="hidden w-56 border-r border-gray-800 bg-gray-950 p-4 lg:block">
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
                  ? 'bg-blue-900/50 text-blue-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
