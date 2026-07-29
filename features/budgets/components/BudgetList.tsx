'use client';

import { deleteBudget } from '../actions';
import { useRouter } from 'next/navigation';

type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  category: { id: string; name: string; color: string } | null;
};

export function BudgetList({
  budgets,
  month,
  year,
}: {
  budgets: Budget[];
  month: number;
  year: number;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set('budgetId', id);
    await deleteBudget(fd);
    router.refresh();
  }

  if (budgets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Sin presupuestos para {month}/{year}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const pct =
          b.amount > 0
            ? Math.min(Math.round((b.spent / b.amount) * 100), 100)
            : 0;
        const barColor =
          pct > 100
            ? 'bg-red-500'
            : pct > 80
              ? 'bg-yellow-500'
              : 'bg-green-500';

        return (
          <div key={b.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: b.category?.color || '#6b7280',
                  }}
                />
                <span className="text-sm font-medium">
                  {b.category?.name || 'Sin categoría'}
                </span>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="mb-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                ${b.spent.toLocaleString('es-CL')} gastado
              </span>
              <span>
                ${b.amount.toLocaleString('es-CL')} presupuestado
              </span>
            </div>

            {pct > 100 && (
              <p className="mt-1 text-xs text-red-500">
                ¡Excediste el presupuesto en{' '}
                <strong>
                  ${(b.spent - b.amount).toLocaleString('es-CL')}
                </strong>
                !
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
