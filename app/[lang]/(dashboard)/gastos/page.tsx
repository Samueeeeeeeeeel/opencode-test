'use client';

import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/features/transactions/actions';

type Tab = 'all' | 'expense' | 'income';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'expense', label: 'Gasto' },
  { key: 'income', label: 'Ingreso' },
];

export default function GastosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', activeTab],
    queryFn: () =>
      getTransactions(
        activeTab === 'all' ? {} : { type: activeTab },
        1,
        50
      ),
  });

  const transactions = data?.transactions || [];

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-lg font-bold text-white">Movimientos</h1>

      <div className="flex gap-1 rounded-lg bg-gray-900/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-gray-900/50 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No hay movimientos</p>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    backgroundColor: tx.category?.color || '#6b7280',
                  }}
                >
                  {(tx.category?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {tx.note || tx.category?.name || 'Sin descripción'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
