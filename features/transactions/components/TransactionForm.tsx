'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from '../schemas';
import { createTransaction } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Account = { id: string; name: string; color: string };
type Category = { id: string; name: string; color: string; type: string };

export function TransactionForm({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: 'expense', status: 'confirmed' },
  });

  const watchType = form.watch('type');

  async function onSubmit(data: CreateTransactionInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('type', data.type);
    fd.set('amount', String(data.amount));
    fd.set('accountId', data.accountId);
    fd.set('categoryId', data.categoryId);
    fd.set('date', data.date);
    fd.set('status', data.status || 'confirmed');
    if (data.note) fd.set('note', data.note);

    const result = await createTransaction(fd);

    if (result?.error) {
      const err = result.error;
      if (typeof err === 'object' && 'form' in err) {
        setMessage((err as unknown as { form: string }).form);
      } else {
        setMessage('Error al crear transacción');
      }
    } else {
      setMessage('Transacción creada');
      form.reset({ type: 'expense', status: 'confirmed' });
      router.refresh();
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.type === watchType
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Transacción creada'
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
          placeholder="15000"
        />
        {form.formState.errors.amount && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.amount.message}
          </p>
        )}
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
        {form.formState.errors.accountId && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.accountId.message}
          </p>
        )}
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
        {form.formState.errors.categoryId && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input
          type="date"
          {...form.register('date')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.date && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.date.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Nota</label>
        <input
          type="text"
          {...form.register('note')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          placeholder="Opcional"
        />
      </div>

      <div className="flex gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.watch('status') === 'pending'}
            onChange={(e) =>
              form.setValue(
                'status',
                e.target.checked ? 'pending' : 'confirmed'
              )
            }
          />
          Pendiente
        </label>
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Crear transacción
      </button>
    </form>
  );
}
