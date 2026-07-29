'use client';

import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

type InstallmentDetail = {
  id: string;
  totalAmount: number;
  numberOfInstallments: number;
  installmentValue: number;
  startDate: string;
  status: string;
  note: string | null;
  category: { name: string; color: string } | null;
  account: { name: string } | null;
  paidCount: number;
  payments: {
    id: string;
    amount: number;
    date: string;
    status: string;
  }[];
};

async function getInstallmentDetail(id: string): Promise<InstallmentDetail | null> {
  const res = await fetch(`/api/credit/${id}`);
  if (!res.ok) return null;
  return res.json();
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
      <div
        className="h-full rounded-full bg-purple-500 transition-all"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default function InstallmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: installment, isLoading } = useQuery({
    queryKey: ['installment', id],
    queryFn: () => getInstallmentDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="h-8 w-32 rounded bg-gray-900/50 animate-pulse" />
        <div className="h-40 rounded-xl bg-gray-900/50 animate-pulse" />
      </div>
    );
  }

  if (!installment) {
    return (
      <div className="mx-auto max-w-md py-8 text-center text-gray-500">
        Cuota no encontrada
      </div>
    );
  }

  const remaining = installment.numberOfInstallments - installment.paidCount;
  const totalRemaining = remaining * installment.installmentValue;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: installment.category?.color || '#6b7280' }}
          >
            {(installment.category?.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              {installment.note || installment.category?.name || 'Cuota'}
            </h1>
            <p className="text-sm text-gray-400">{installment.account?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Total
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {formatCurrency(installment.totalAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Cuota mensual
          </p>
          <p className="mt-1 text-lg font-bold text-purple-400">
            {formatCurrency(installment.installmentValue)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Progreso: {installment.paidCount}/{installment.numberOfInstallments} cuotas
          </span>
          <span className="text-purple-400">
            Por pagar: {remaining} ({formatCurrency(totalRemaining)})
          </span>
        </div>
        <ProgressBar current={installment.paidCount} total={installment.numberOfInstallments} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-400">Historial de pagos</h2>
        {installment.payments.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No hay pagos registrados</p>
        ) : (
          <div className="space-y-1">
            {installment.payments.map((payment, i) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      Cuota {i + 1}/{installment.numberOfInstallments}
                    </p>
                    <p className="text-xs text-gray-500">{payment.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    payment.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
