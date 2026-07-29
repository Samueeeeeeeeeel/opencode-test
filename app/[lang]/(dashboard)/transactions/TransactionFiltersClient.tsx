'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import { useState } from 'react';

type Account = { id: string; name: string };
type Category = { id: string; name: string; type: string };

export function TransactionFilters({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const updateFilter = useDebouncedCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    300
  );

  function handleSearch(value: string) {
    setSearch(value);
    updateFilter('search', value);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar..."
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      />

      <select
        defaultValue={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Todos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </select>

      <select
        defaultValue={searchParams.get('status') || ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Todos</option>
        <option value="confirmed">Confirmados</option>
        <option value="pending">Pendientes</option>
      </select>

      <select
        defaultValue={searchParams.get('accountId') || ''}
        onChange={(e) => updateFilter('accountId', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Todas las cuentas</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('categoryId') || ''}
        onChange={(e) => updateFilter('categoryId', e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
