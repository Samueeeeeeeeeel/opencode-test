'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '../schemas';
import { changePassword } from '../actions';
import { useState } from 'react';

export function ChangePasswordForm() {
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordInput) {
    setMessage(null);
    const formData = new FormData();
    formData.set('currentPassword', data.currentPassword);
    formData.set('newPassword', data.newPassword);
    formData.set('confirmPassword', data.confirmPassword);

    const result = await changePassword(formData);

    if (result?.error) {
      setMessage(typeof result.error === 'string' ? result.error : 'Error');
    } else {
      setMessage('Contraseña actualizada');
      form.reset();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium">Cambiar contraseña</h3>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Contraseña actualizada'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Contraseña actual
        </label>
        <input
          type="password"
          {...form.register('currentPassword')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.currentPassword && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Nueva contraseña
        </label>
        <input
          type="password"
          {...form.register('newPassword')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Confirmar nueva contraseña
        </label>
        <input
          type="password"
          {...form.register('confirmPassword')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Cambiar contraseña
      </button>
    </form>
  );
}
