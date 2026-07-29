'use client';

import { deleteRecurringTransaction, processRecurringTransactions } from '../actions';
import { useRouter } from 'next/navigation';

type Recurring = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  frequency: string;
  nextExecution: string;
  isActive: boolean;
  note: string | null;
  account: { id: string; name: string } | null;
  category: { id: string; name: string; color: string } | null;
};

export function RecurringList({
  recurring,
}: {
  recurring: Recurring[];
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set('recurringId', id);
    await deleteRecurringTransaction(fd);
    router.refresh();
  }

  async function handleProcess() {
    await processRecurringTransactions();
    router.refresh();
  }

  const freqLabels: Record<string, string> = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    yearly: 'Anual',
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleProcess}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
        >
          Procesar pendientes
        </button>
      </div>

      {recurring.length === 0 && (
        <p className="py-4 text-center text-sm text-gray-500">
          Sin transacciones recurrentes
        </p>
      )}

      {recurring.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{
                backgroundColor: r.category?.color || '#6b7280',
              }}
            >
              {(r.category?.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">
                {r.category?.name || 'Sin categoría'}
              </p>
              <p className="text-xs text-gray-500">
                {freqLabels[r.frequency] || r.frequency} &middot;{' '}
                {r.account?.name}
                {r.note && ` · ${r.note}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span
                className={`text-sm font-semibold ${
                  r.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                ${r.amount.toLocaleString('es-CL')}
              </span>
              <p className="text-[10px] text-gray-400">
                Próxima: {r.nextExecution}
              </p>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Detener
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
