'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from '../settingsSchema';
import { updateSettings } from '../settingsActions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

type Settings = {
  closingDay: number;
  theme: string;
  language: string;
  pushNotificationsEnabled: boolean;
  budgetAlerts: boolean;
  installmentReminders: boolean;
  goalReminders: boolean;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      closingDay: settings.closingDay,
      theme: settings.theme as 'light' | 'dark' | 'system',
      language: settings.language as 'es' | 'en',
    },
  });

  const [pushEnabled, setPushEnabled] = useState(
    settings.pushNotificationsEnabled
  );
  const [budgetAlerts, setBudgetAlerts] = useState(
    settings.budgetAlerts
  );
  const [installmentReminders, setInstallmentReminders] = useState(
    settings.installmentReminders
  );
  const [goalReminders, setGoalReminders] = useState(
    settings.goalReminders
  );

  async function onSubmit(data: UpdateSettingsInput) {
    setMessage(null);
    const fd = new FormData();
    fd.set('closingDay', String(data.closingDay));
    fd.set('theme', data.theme);
    fd.set('language', data.language);
    if (pushEnabled) fd.set('pushNotificationsEnabled', 'on');
    if (budgetAlerts) fd.set('budgetAlerts', 'on');
    if (installmentReminders) fd.set('installmentReminders', 'on');
    if (goalReminders) fd.set('goalReminders', 'on');

    const result = await updateSettings(fd);

    if (result?.error) {
      setMessage('Error al guardar configuración');
    } else {
      setMessage('Configuración guardada');
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message === 'Configuración guardada'
              ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
          }`}
        >
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Día de cierre de mes
        </label>
        <select
          {...form.register('closingDay')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              Día {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Tema</label>
        <select
          {...form.register('theme', {
            onChange: (e) => setTheme(e.target.value),
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="system">Sistema</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Idioma</label>
        <select
          {...form.register('language')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Notificaciones</legend>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={(e) => setPushEnabled(e.target.checked)}
          />
          Notificaciones push
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={budgetAlerts}
            onChange={(e) => setBudgetAlerts(e.target.checked)}
          />
          Alertas de presupuesto
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={installmentReminders}
            onChange={(e) => setInstallmentReminders(e.target.checked)}
          />
          Recordatorios de cuotas
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={goalReminders}
            onChange={(e) => setGoalReminders(e.target.checked)}
          />
          Recordatorios de metas
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Guardar configuración
      </button>
    </form>
  );
}
