'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { payDebtSchema, type PayDebtInput } from '../schemas';
import { payDebt, deleteDebt } from '../actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Debt = {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: string | null;
  startDate: string;
  dueDate: string | null;
  personName: string | null;
  status: string;
};

export function DebtList({ debts }: { debts: Debt[] }) {
  const router = useRouter();
  const [payingDebt, setPayingDebt] = useState<string | null>(null);

  const form = useForm<PayDebtInput>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  });

  async function handlePay(data: PayDebtInput) {
    const fd = new FormData();
    fd.set('debtId', data.debtId);
    fd.set('amount', String(data.amount));
    fd.set('date', data.date);
    if (data.note) fd.set('note', data.note);

    const result = await payDebt(fd);
    if (result?.success) {
      setPayingDebt(null);
      form.reset({ date: new Date().toISOString().split('T')[0] });
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set('debtId', id);
    await deleteDebt(fd);
    router.refresh();
  }

  const activeDebts = debts.filter((d) => d.status === 'active');

  if (activeDebts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay deudas activas
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeDebts.map((debt) => {
        const pct = Math.min(
          Math.round((debt.paidAmount / debt.totalAmount) * 100),
          100
        );

        return (
          <div
            key={debt.id}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{debt.name}</span>
                {debt.personName && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({debt.personName})
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(debt.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Cancelar
              </button>
            </div>

            {debt.interestRate && (
              <p className="mb-1 text-xs text-gray-500">
                Tasa: {debt.interestRate}%
              </p>
            )}

            <div className="mb-1 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-3 rounded-full bg-orange-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                ${debt.paidAmount.toLocaleString('es-CL')} pagado de{' '}
                ${debt.totalAmount.toLocaleString('es-CL')}
              </span>
              <span>{pct}%</span>
            </div>

            <div className="mt-1 flex gap-2 text-xs text-gray-400">
              <span>Inicio: {debt.startDate}</span>
              {debt.dueDate && <span>Vence: {debt.dueDate}</span>}
            </div>

            {payingDebt === debt.id ? (
              <form
                onSubmit={form.handleSubmit((data) =>
                  handlePay({ ...data, debtId: debt.id })
                )}
                className="mt-3 flex gap-2"
              >
                <input
                  type="number"
                  {...form.register('amount')}
                  className="block w-28 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
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
                  Pagar
                </button>
                <button
                  type="button"
                  onClick={() => setPayingDebt(null)}
                  className="text-xs text-gray-500"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setPayingDebt(debt.id);
                  form.setValue('debtId', debt.id);
                }}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                + Registrar pago
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
