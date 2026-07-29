'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/features/accounts/actions';
import { createCategory } from '@/features/categories/actions';
import { updateSettings } from '@/features/user/settingsActions';

const DEFAULT_CATEGORIES = {
  expense: [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Salud',
    'Educación',
    'Entretención',
    'Ropa',
  ],
  income: ['Sueldo', 'Freelance', 'Inversiones', 'Otros'],
};

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<
    'checking' | 'savings' | 'cash' | 'credit_card'
  >('checking');
  const [closingDay, setClosingDay] = useState(1);

  async function handleFinish() {
    setLoading(true);

    // Step 1: create initial account
    if (accountName) {
      const fd = new FormData();
      fd.set('name', accountName);
      fd.set('type', accountType);
      fd.set('color', COLORS[0]);
      await createAccount(fd);
    }

    // Step 2: create default categories
    for (const cat of DEFAULT_CATEGORIES.expense) {
      const fd = new FormData();
      fd.set('name', cat);
      fd.set('type', 'expense');
      fd.set(
        'color',
        COLORS[DEFAULT_CATEGORIES.expense.indexOf(cat) % COLORS.length]
      );
      await createCategory(fd);
    }
    for (const cat of DEFAULT_CATEGORIES.income) {
      const fd = new FormData();
      fd.set('name', cat);
      fd.set('type', 'income');
      fd.set(
        'color',
        COLORS[DEFAULT_CATEGORIES.income.indexOf(cat) % COLORS.length]
      );
      await createCategory(fd);
    }

    // Step 3: save closing day
    const sfd = new FormData();
    sfd.set('closingDay', String(closingDay));
    sfd.set('theme', 'system');
    sfd.set('language', 'es');
    sfd.set('onboardingCompleted', 'on');
    await updateSettings(sfd);

    router.push('/dashboard');
    router.refresh();
  }

  const steps = [
    {
      title: 'Crea tu primera cuenta',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Puedes empezar con una cuenta o saltar este paso.
          </p>
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              placeholder="Ej: Banco Estado"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as typeof accountType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="checking">Corriente</option>
              <option value="savings">Ahorro</option>
              <option value="cash">Efectivo</option>
              <option value="credit_card">Tarjeta de crédito</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: 'Configura tu mes',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Elige el día de cierre de tu mes financiero.
          </p>
          <div>
            <label className="block text-sm font-medium">
              Día de cierre
            </label>
            <select
              value={closingDay}
              onChange={(e) => setClosingDay(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Día {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: '¡Listo!',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vamos a crear categorías por defecto para que puedas empezar
            a registrar tus gastos e ingresos de inmediato.
          </p>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categorías de gasto
            </p>
            <div className="flex flex-wrap gap-1">
              {DEFAULT_CATEGORIES.expense.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/50 dark:text-red-300"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categorías de ingreso
            </p>
            <div className="flex flex-wrap gap-1">
              {DEFAULT_CATEGORIES.income.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full ${
              i <= step
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-xl font-bold">
          {steps[step].title}
        </h2>
        {steps[step].content}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Atrás
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Configurando...' : 'Ir al dashboard'}
          </button>
        )}
      </div>
    </div>
  );
}
