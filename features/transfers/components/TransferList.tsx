'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note: string | null;
  fromAccount: { id: string; name: string; color: string } | null;
  toAccount: { id: string; name: string; color: string } | null;
};

export function TransferList({
  transfers,
}: {
  transfers: Transfer[];
}) {
  if (transfers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay transferencias
      </p>
    );
  }

  function formatDate(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return format(d, 'dd MMM yyyy', { locale: es });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-2">
      {transfers.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center text-xs text-gray-400">
              <div
                className="h-2 w-8 rounded-t-sm"
                style={{ backgroundColor: t.fromAccount?.color || '#6b7280' }}
              />
              <div className="text-[10px]">&darr;</div>
              <div
                className="h-2 w-8 rounded-b-sm"
                style={{ backgroundColor: t.toAccount?.color || '#6b7280' }}
              />
            </div>

            <div>
              <p className="text-sm font-medium">
                {t.fromAccount?.name || '?'} →{' '}
                {t.toAccount?.name || '?'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(t.date)}
                {t.note && ` · ${t.note}`}
              </p>
            </div>
          </div>

          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ${t.amount.toLocaleString('es-CL')}
          </span>
        </div>
      ))}
    </div>
  );
}
