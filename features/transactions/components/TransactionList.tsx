'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { confirmTransaction, softDeleteTransaction } from '../actions';
import { useRouter } from 'next/navigation';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  status: 'confirmed' | 'pending';
  note: string | null;
  installmentId: string | null;
  account: { id: string; name: string; color: string } | null;
  category: { id: string; name: string; color: string } | null;
};

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();

  async function handleConfirm(id: string) {
    const fd = new FormData();
    fd.set('transactionId', id);
    await confirmTransaction(fd);
    router.refresh();
  }

  async function handleSoftDelete(id: string) {
    const fd = new FormData();
    fd.set('transactionId', id);
    await softDeleteTransaction(fd);
    router.refresh();
  }

  function formatAmount(amount: number) {
    const prefix = amount >= 0 ? '' : '-';
    return `${prefix}$${Math.abs(amount).toLocaleString('es-CL')}`;
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return format(d, 'dd MMM', { locale: es });
    } catch {
      return dateStr;
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay transacciones
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800"
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {tx.category?.name || 'Sin categoría'}
                </span>
                {tx.status === 'pending' && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
                    Pendiente
                  </span>
                )}
                {tx.installmentId && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    Cuota
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(tx.date)}</span>
                <span>{tx.account?.name}</span>
                {tx.note && <span>&middot; {tx.note}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${
                tx.type === 'income'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {tx.type === 'income' ? '+' : '-'}
              {formatAmount(tx.amount)}
            </span>

            {tx.status === 'pending' && (
              <button
                onClick={() => handleConfirm(tx.id)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Confirmar
              </button>
            )}
            {tx.status === 'pending' && (
              <button
                onClick={() => handleSoftDelete(tx.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
