'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAccountSchema,
  type CreateAccountInput,
} from '../schemas';
import { createAccount } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Corriente' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de crédito' },
] as const;

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export function AccountForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { color: COLORS[0] },
  });

  async function onSubmit(data: CreateAccountInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('type', data.type);
    fd.set('color', data.color);
    if (data.icon) fd.set('icon', data.icon);

    const result = await createAccount(fd);

    if (result?.error) {
      setMessage('Error al crear cuenta');
    } else {
      setMessage('Cuenta creada');
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
            message === 'Cuenta creada'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
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
          placeholder="Ej: Banco Estado"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <select
          {...form.register('type')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">Selecciona un tipo</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {form.formState.errors.type && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Color</label>
        <div className="mt-1 flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => form.setValue('color', c)}
              className={`h-8 w-8 rounded-full border-2 ${
                form.watch('color') === c
                  ? 'border-gray-900 dark:border-white'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Crear cuenta
      </button>
    </form>
  );
}
