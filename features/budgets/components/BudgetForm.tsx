'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBudgetSchema, type CreateBudgetInput } from '../schemas';
import { createBudget } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string; color: string };

export function BudgetForm({
  categories,
  month,
  year,
}: {
  categories: Category[];
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { month, year },
  });

  async function onSubmit(data: CreateBudgetInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('categoryId', data.categoryId);
    fd.set('amount', String(data.amount));
    fd.set('month', String(data.month));
    fd.set('year', String(data.year));

    const result = await createBudget(fd);

    if (result?.error) {
      setMessage('Error al crear presupuesto');
    } else {
      setMessage('Presupuesto guardado');
      form.reset({ month, year });
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Presupuesto guardado'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          } dark:${
            message === 'Presupuesto guardado'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-red-900/50 text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <select
          {...form.register('categoryId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Monto ($)</label>
        <input
          type="number"
          {...form.register('amount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Mes</label>
          <select
            {...form.register('month')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Año</label>
          <input
            type="number"
            {...form.register('year')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Guardar presupuesto
      </button>
    </form>
  );
}
