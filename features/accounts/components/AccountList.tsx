'use client';

import { deleteAccount } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Account = {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card';
  color: string;
  icon: string | null;
  isActive: boolean;
  balance: number;
};

const TYPE_LABELS: Record<string, string> = {
  checking: 'Corriente',
  savings: 'Ahorro',
  cash: 'Efectivo',
  credit_card: 'Tarjeta de crédito',
};

export function AccountList({ accounts }: { accounts: Account[] }) {
  const router = useRouter();

  async function handleDelete(accountId: string) {
    const fd = new FormData();
    fd.set('accountId', accountId);
    await deleteAccount(fd);
    router.refresh();
  }

  function formatBalance(balance: number) {
    return `$${(balance / 100).toLocaleString('es-CL')}`;
  }

  return (
    <div className="space-y-3">
      {accounts.length === 0 && (
        <p className="text-sm text-gray-500">
          No tienes cuentas aún. Crea tu primera cuenta.
        </p>
      )}

      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: account.color }}
            >
              {account.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {account.name}
              </p>
              <p className="text-xs text-gray-500">
                {TYPE_LABELS[account.type] || account.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-semibold ${
                account.balance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatBalance(account.balance)}
            </span>

            <button
              onClick={() => handleDelete(account.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Archivar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
