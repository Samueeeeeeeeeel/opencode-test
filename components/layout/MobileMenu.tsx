'use client';

import { MovementForm } from '@/features/transactions/components/MovementForm';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/budgets', label: 'Presupuestos' },
  { href: '/goals', label: 'Metas' },
  { href: '/reports', label: 'Reportes' },
];

export function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-gray-950 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Menú</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick links */}
        <nav className="mb-6 flex flex-col gap-1">
          {menuItems.map((item) => {
            const localizedHref = `/${locale}${item.href}`;
            const isActive = pathname.endsWith(item.href);

            return (
              <Link
                key={item.href}
                href={localizedHref}
                onClick={onClose}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* New movement form */}
        <div className="border-t border-gray-800 pt-4">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Nuevo movimiento
          </h3>
          <MovementForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
