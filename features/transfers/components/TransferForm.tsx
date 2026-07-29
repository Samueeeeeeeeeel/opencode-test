'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTransferSchema,
  type CreateTransferInput,
} from '../schemas';
import { createTransfer } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Account = { id: string; name: string; color: string };

export function TransferForm({
  accounts,
}: {
  accounts: Account[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
  });

  async function onSubmit(data: CreateTransferInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('fromAccountId', data.fromAccountId);
    fd.set('toAccountId', data.toAccountId);
    fd.set('amount', String(data.amount));
    fd.set('date', data.date);
    if (data.note) fd.set('note', data.note);

    const result = await createTransfer(fd);

    if (result?.error) {
      const err = result.error;
      if (typeof err === 'object' && 'form' in err) {
        setMessage((err as unknown as { form: string }).form);
      } else {
        setMessage('Error al crear transferencia');
      }
    } else {
      setMessage('Transferencia creada');
      form.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Transferencia creada'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Cuenta origen
        </label>
        <select
          {...form.register('fromAccountId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona cuenta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {form.formState.errors.fromAccountId && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.fromAccountId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Cuenta destino
        </label>
        <select
          {...form.register('toAccountId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona cuenta</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {form.formState.errors.toAccountId && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.toAccountId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Monto ($)</label>
        <input
          type="number"
          {...form.register('amount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.amount && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.amount.message}
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
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Transferir
      </button>
    </form>
  );
}
