'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createInstallmentSchema,
  type CreateInstallmentInput,
} from '../schemas';
import { createInstallmentTransaction } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Account = { id: string; name: string; color: string };
type Category = { id: string; name: string; color: string; type: string };

export function InstallmentForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateInstallmentInput>({
    resolver: zodResolver(createInstallmentSchema),
    defaultValues: {
      type: 'expense',
      numberOfInstallments: 3,
    },
  });

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  async function onSubmit(data: CreateInstallmentInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('type', data.type);
    fd.set('totalAmount', String(data.totalAmount));
    fd.set('accountId', data.accountId);
    fd.set('categoryId', data.categoryId);
    fd.set('numberOfInstallments', String(data.numberOfInstallments));
    fd.set('startDate', data.startDate);
    if (data.note) fd.set('note', data.note);

    const result = await createInstallmentTransaction(fd);

    if (result?.error) {
      const err = result.error;
      if (typeof err === 'object' && 'form' in err) {
        setMessage((err as unknown as { form: string }).form);
      } else {
        setMessage('Error al crear cuotas');
      }
    } else {
      setMessage('Cuotas creadas');
      form.reset({ type: 'expense', numberOfInstallments: 3 });
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-semibold">Compra en cuotas</h3>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Cuotas creadas'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Monto total ($)
        </label>
        <input
          type="number"
          {...form.register('totalAmount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.totalAmount && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.totalAmount.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Nº de cuotas</label>
        <input
          type="number"
          {...form.register('numberOfInstallments')}
          min={2}
          max={48}
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
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Fecha primera cuota
        </label>
        <input
          type="date"
          {...form.register('startDate')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
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
        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        Crear cuotas
      </button>
    </form>
  );
}
