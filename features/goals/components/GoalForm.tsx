'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGoalSchema, type CreateGoalInput } from '../schemas';
import { createGoal } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export function GoalForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: { color: COLORS[0] },
  });

  async function onSubmit(data: CreateGoalInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('name', data.name);
    fd.set('targetAmount', String(data.targetAmount));
    if (data.targetDate) fd.set('targetDate', data.targetDate);
    if (data.accountId) fd.set('accountId', data.accountId);
    if (data.color) fd.set('color', data.color);

    const result = await createGoal(fd);

    if (result?.error) {
      setMessage('Error al crear meta');
    } else {
      setMessage('Meta creada');
      form.reset({ color: COLORS[0] });
      router.refresh();
      onDone?.();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Meta creada'
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
          placeholder="Ej: Viaje a Japón"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Monto objetivo ($)
        </label>
        <input
          type="number"
          {...form.register('targetAmount')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Fecha objetivo (opcional)
        </label>
        <input
          type="date"
          {...form.register('targetDate')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Color</label>
        <div className="mt-1 flex flex-wrap gap-2">
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
        Crear meta
      </button>
    </form>
  );
}
