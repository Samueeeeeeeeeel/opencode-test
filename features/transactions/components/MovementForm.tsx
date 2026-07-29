'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from '../schemas';
import { createTransaction, createInstallmentTransaction } from '../actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type MovementType = 'income' | 'expense' | 'installment';

interface MovementFormProps {
  onClose?: () => void;
  fullPage?: boolean;
}

export function MovementForm({
  onClose,
  fullPage = false,
}: MovementFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<MovementType>('income');

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: 'income', status: 'confirmed' },
  });

  const [numberOfInstallments, setNumberOfInstallments] = useState(3);

  async function onSubmit(data: CreateTransactionInput) {
    setMessage(null);

    try {
    if (activeType === 'installment') {
      if (!data.amount || data.amount <= 0) {
        setMessage('Ingresa un monto válido');
        return;
      }
      if (numberOfInstallments < 2) {
        setMessage('Mínimo 2 cuotas');
        return;
      }

      const fd = new FormData();
      fd.set('type', 'expense');
      fd.set('totalAmount', String(data.amount));
      fd.set('numberOfInstallments', String(numberOfInstallments));
      fd.set('startDate', data.date);
      if (data.note) fd.set('note', data.note);

      const result = await createInstallmentTransaction(fd);

      if (result?.error) {
        const err = result.error as Record<string, unknown>;
        const errMsg = typeof err === 'string'
          ? err
          : (err as Record<string, string[]>).form?.[0]
            || Object.values(err as Record<string, string[]>).flat()[0]
            || 'Error al crear cuotas';
        setMessage(errMsg);
      } else {
        setMessage('Cuotas creadas');
        form.reset({ type: 'income', status: 'confirmed' });
        setNumberOfInstallments(3);
        router.refresh();
        onClose?.();
      }
    } else {
      const fd = new FormData();
      fd.set('type', data.type);
      fd.set('amount', String(data.amount));
      fd.set('date', data.date);
      fd.set('status', 'confirmed');
      if (data.note) fd.set('note', data.note);

      const result = await createTransaction(fd);

      if (result?.error) {
        const err = result.error as Record<string, unknown>;
        const errMsg = typeof err === 'string'
          ? err
          : (err as Record<string, string[]>).form?.[0]
            || Object.values(err as Record<string, string[]>).flat()[0]
            || 'Error al crear transacción';
        setMessage(errMsg);
      } else {
        setMessage('Transacción creada');
        form.reset({ type: 'income', status: 'confirmed' });
        router.refresh();
        onClose?.();
      }
    }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error de conexión');
    }
  }

  const content = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
          type: (activeType === 'installment' ? 'expense' : activeType) as 'income' | 'expense',
          amount: Number(formData.get('amount')) || 0,
          date: formData.get('date') as string || '',
          status: 'confirmed' as const,
          note: (formData.get('note') as string) || undefined,
        };
        onSubmit(data);
      }}
      className="space-y-5"
    >
      {message && (
        <div
          className={cn(
            'rounded-lg p-3 text-sm',
            message.includes('cread')
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}
        >
          {message}
        </div>
      )}

      {/* Type tabs */}
      <div>
        <label className="mb-2 block text-sm text-gray-400">Tipo</label>
        <div className="flex gap-2">
          {(
            [
              { value: 'income', label: 'Ingreso' },
              { value: 'expense', label: 'Gasto' },
              { value: 'installment', label: 'Cuota' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActiveType(tab.value);
                if (tab.value !== 'installment') {
                  form.setValue('type', tab.value);
                }
              }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors',
                activeType === tab.value
                  ? tab.value === 'income'
                    ? 'bg-green-500 text-white'
                    : tab.value === 'expense'
                      ? 'bg-gray-600 text-white'
                      : 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-400">
          Descripción
        </label>
        <input
          type="text"
          name="note"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ej: Superchats del stream de YouTube"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-400">
          Monto (CLP)
        </label>
        <input
          type="number"
          name="amount"
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="15000"
        />
      </div>

      {/* Number of installments - only for Cuota */}
      {activeType === 'installment' && (
        <div>
          <label className="mb-1.5 block text-sm text-gray-400">
            Número de cuotas
          </label>
          <input
            type="number"
            min={2}
            max={48}
            value={numberOfInstallments}
            onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="3"
          />
          <p className="mt-1 text-xs text-gray-500">
            Valor cuota: ${Math.round((Number(form.watch('amount')) || 0) / numberOfInstallments).toLocaleString('es-CL')}
          </p>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="mb-1.5 block text-sm text-gray-400">Fecha</label>
        <input
          type="date"
          name="date"
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        Ingresar
      </button>
    </form>
  );

  if (fullPage) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">Nuevo movimiento</h1>
        {content}
      </div>
    );
  }

  return content;
}
