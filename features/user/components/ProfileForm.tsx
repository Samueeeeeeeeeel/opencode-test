'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput } from '../schemas';
import { updateProfile } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProfileForm({
  user,
}: {
  user: { name: string | null; email: string; image: string | null };
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name || '' },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setMessage(null);
    const formData = new FormData();
    formData.set('name', data.name);
    if (data.image) formData.set('image', data.image);

    const result = await updateProfile(formData);

    if (result?.error) {
      setMessage(typeof result.error === 'string' ? result.error : 'Error');
    } else {
      setMessage('Perfil actualizado');
      router.refresh();
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      form.setValue('image', base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Perfil actualizado'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          {user.image || form.watch('image') ? (
            <img
              src={user.image || form.watch('image') || ''}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-bold text-gray-500">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
          Cambiar foto
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          {...form.register('name')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm opacity-60 dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Guardar cambios
      </button>
    </form>
  );
}
