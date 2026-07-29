'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFundsSchema, type AddFundsInput } from '../schemas';
import { addFunds, deleteGoal } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  color: string | null;
  status: string;
};

export function GoalList({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [fundingGoal, setFundingGoal] = useState<string | null>(null);

  const form = useForm<AddFundsInput>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });

  async function handleAddFunds(data: AddFundsInput) {
    const fd = new FormData();
    fd.set('goalId', data.goalId);
    fd.set('amount', String(data.amount));
    fd.set('date', data.date);
    if (data.note) fd.set('note', data.note);

    const result = await addFunds(fd);
    if (result?.success) {
      setFundingGoal(null);
      form.reset({ date: new Date().toISOString().split('T')[0] });
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set('goalId', id);
    await deleteGoal(fd);
    router.refresh();
  }

  const activeGoals = goals.filter((g) => g.status === 'active');

  if (activeGoals.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay metas activas
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeGoals.map((goal) => {
        const pct = Math.min(
          Math.round((goal.currentAmount / goal.targetAmount) * 100),
          100
        );
        const remaining = goal.targetAmount - goal.currentAmount;

        return (
          <div
            key={goal.id}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: goal.color || '#3b82f6',
                  }}
                />
                <span className="text-sm font-medium">{goal.name}</span>
              </div>
              <button
                onClick={() => handleDelete(goal.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Cancelar
              </button>
            </div>

            <div className="mb-1 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-3 rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                ${goal.currentAmount.toLocaleString('es-CL')} de{' '}
                ${goal.targetAmount.toLocaleString('es-CL')}
              </span>
              <span>{pct}%</span>
            </div>

            {goal.targetDate && (
              <p className="mt-1 text-xs text-gray-400">
                Meta: {goal.targetDate} &middot; Faltan $
                {remaining.toLocaleString('es-CL')}
              </p>
            )}

            {fundingGoal === goal.id ? (
              <form
                onSubmit={form.handleSubmit((data) =>
                  handleAddFunds({ ...data, goalId: goal.id })
                )}
                className="mt-3 flex gap-2"
              >
                <input
                  type="number"
                  {...form.register('amount')}
                  className="block w-32 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                  placeholder="Monto"
                />
                <input
                  type="date"
                  {...form.register('date')}
                  className="block rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                />
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Aportar
                </button>
                <button
                  type="button"
                  onClick={() => setFundingGoal(null)}
                  className="text-xs text-gray-500"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setFundingGoal(goal.id);
                  form.setValue('goalId', goal.id);
                }}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                + Aportar fondos
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
