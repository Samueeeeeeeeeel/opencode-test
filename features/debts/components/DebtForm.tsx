'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDebtSchema, type CreateDebtInput } from '../schemas';
import { createDebt } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DebtForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateDebtInput>({
    resolver: zodResolver(createDebtSchema),
  });

  async function onSubmit(data: CreateDebtInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('totalAmount', String(data.totalAmount));
    if (data.interestRate) fd.set('interestRate', String(data.interestRate));
    fd.set('startDate', data.startDate);
    if (data.dueDate) fd.set('dueDate', data.dueDate);
    if (data.personName) fd.set('personName', data.personName);

    const result = await createDebt(fd);

    if (result?.error) {
      setMessage('Error al crear deuda');
    } else {
      setMessage('Deuda creada');
      form.reset();
      router.refresh();
      onDone?.();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Deuda creada'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          } dark:${
            message === 'Deuda creada'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-red-900/50 text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          {...form.register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          placeholder="Ej: Préstamo banco"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Monto total ($)
        </label>
        <input
          type="number"
          {...form.register('totalAmount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Tasa interés (%) - opcional
        </label>
        <input
          type="number"
          step="0.01"
          {...form.register('interestRate')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
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
            Fecha vencimiento
          </label>
          <input
            type="date"
            {...form.register('dueDate')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Persona (opcional)
        </label>
        <input
          type="text"
          {...form.register('personName')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Crear deuda
      </button>
    </form>
  );
}
