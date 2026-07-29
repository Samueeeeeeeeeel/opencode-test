'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';
import { useState } from 'react';

export function TransactionFilters() {
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
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />

      <select
        defaultValue={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
      >
        <option value="">Todos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </select>
    </div>
  );
}
