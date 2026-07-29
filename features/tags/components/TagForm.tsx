'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTagSchema, type CreateTagInput } from '../schemas';
import { createTag } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TagForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
  });

  async function onSubmit(data: CreateTagInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('name', data.name);

    const result = await createTag(fd);

    if (result?.error) {
      setMessage('Error al crear etiqueta');
    } else {
      setMessage('Etiqueta creada');
      form.reset();
      router.refresh();
      onDone?.();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
      <input
        type="text"
        {...form.register('name')}
        className="block flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        placeholder="Nombre de la etiqueta"
      />
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Crear
      </button>
      {form.formState.errors.name && (
        <p className="text-xs text-red-500">
          {form.formState.errors.name.message}
        </p>
      )}
    </form>
  );
}
