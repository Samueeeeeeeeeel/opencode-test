'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas';
import { loginUser } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ResultError = Record<string, string[]> | string;
type ActionResult = {
  success?: boolean;
  error?: ResultError;
};

export function LoginForm({ dict }: { dict: { auth: Record<string, string> } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const formData = new FormData();
    formData.set('email', data.email);
    formData.set('password', data.password);

    const result = (await loginUser(formData)) as ActionResult | undefined;

    if (result?.error) {
      if (typeof result.error === 'string') {
        setError(result.error);
      } else {
        const err = result.error as Record<string, string[]>;
        setError(err.form?.[0] || err.email?.[0] || 'Error desconocido');
      }
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          {dict.auth.email}
        </label>
        <input
          id="email"
          type="email"
          {...form.register('email')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          {dict.auth.password}
        </label>
        <input
          id="password"
          type="password"
          {...form.register('password')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        {form.formState.errors.password && (
          <p className="mt-1 text-xs text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {dict.auth.login}
      </button>
    </form>
  );
}
