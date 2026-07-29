'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRecurringSchema,
  type CreateRecurringInput,
} from '../schemas';
import { createRecurringTransaction } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Account = { id: string; name: string };
type Category = { id: string; name: string; type: string };

export function RecurringForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateRecurringInput>({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: { type: 'expense', frequency: 'monthly' },
  });

  const watchType = form.watch('type');
  const filteredCategories = categories.filter(
    (c) => c.type === watchType
  );

  async function onSubmit(data: CreateRecurringInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('type', data.type);
    fd.set('amount', String(data.amount));
    fd.set('accountId', data.accountId);
    fd.set('categoryId', data.categoryId);
    fd.set('frequency', data.frequency);
    fd.set('startDate', data.startDate);
    if (data.endDate) fd.set('endDate', data.endDate);
    if (data.note) fd.set('note', data.note);

    const result = await createRecurringTransaction(fd);

    if (result?.error) {
      setMessage('Error al crear recurrente');
    } else {
      setMessage('Recurrente creado');
      form.reset({ type: 'expense', frequency: 'monthly' });
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Recurrente creado'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => form.setValue('type', 'expense')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            watchType === 'expense'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => form.setValue('type', 'income')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            watchType === 'income'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          Ingreso
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium">Monto ($)</label>
        <input
          type="number"
          {...form.register('amount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Cuenta</label>
        <select
          {...form.register('accountId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona cuenta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <select
          {...form.register('categoryId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona categoría</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Frecuencia</label>
        <select
          {...form.register('frequency')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="weekly">Semanal</option>
          <option value="biweekly">Quincenal</option>
          <option value="monthly">Mensual</option>
          <option value="yearly">Anual</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">
            Fecha inicio
          </label>
          <input
            type="date"
            {...form.register('startDate')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Fecha fin (opcional)
          </label>
          <input
            type="date"
            {...form.register('endDate')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Nota</label>
        <input
          type="text"
          {...form.register('note')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Crear recurrente
      </button>
    </form>
  );
}
