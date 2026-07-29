'use client';

import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type Installment = {
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
};

async function getCreditData(): Promise<{
  installments: Installment[];
  totalThisMonth: number;
  totalRemaining: number;
}> {
  const res = await fetch('/api/credit');
  if (!res.ok) return { installments: [], totalThisMonth: 0, totalRemaining: 0 };
  return res.json();
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
      <div
        className="h-full rounded-full bg-blue-500 transition-all"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

export default function CreditPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['credit'],
    queryFn: getCreditData,
  });

  const installments = data?.installments || [];
  const totalThisMonth = data?.totalThisMonth || 0;
  const totalRemaining = data?.totalRemaining || 0;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-lg font-bold text-white">Crédito</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Cuotas este mes
          </p>
          <p className="mt-1 text-lg font-bold text-purple-400">
            {formatCurrency(totalThisMonth)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Por pagar
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-900/50 animate-pulse" />
          ))}
        </div>
      ) : installments.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No hay cuotas activas
        </p>
      ) : (
        <div className="space-y-2">
          {installments.map((inst) => (
            <button
              key={inst.id}
              onClick={() => router.push(`/budgets/${inst.id}`)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-colors hover:bg-gray-800/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      backgroundColor: inst.category?.color || '#6b7280',
                    }}
                  >
                    {(inst.category?.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {inst.note || inst.category?.name || 'Cuota'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {inst.paidCount}/{inst.numberOfInstallments} cuotas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-400">
                    {formatCurrency(inst.installmentValue)}
                  </p>
                  <p className="text-[10px] text-gray-500">/mes</p>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar
                  current={inst.paidCount}
                  total={inst.numberOfInstallments}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
