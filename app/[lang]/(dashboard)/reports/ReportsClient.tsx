'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Chart } from '@/components/charts/Chart';
import { FadeIn } from '@/components/shared/motion';

type ReportData = {
  transactions: {
    id: string;
    type: string;
    amount: number;
    date: string;
    note: string | null;
    category: { name: string; color: string } | null;
    account: { name: string } | null;
  }[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: { name: string; color: string; total: number }[];
  byMonth: { month: string; income: number; expenses: number }[];
} | null;

type Dict = Record<string, unknown>;

export function ReportsClient({
  data,
  dict,
  lang,
  initialFilters,
}: {
  data: ReportData;
  dict: Dict;
  lang: string;
  initialFilters: { from: string; to: string; type?: string; categoryId?: string; accountId?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState(initialFilters);

  function updateFilter(key: string, value: string) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const d = dict.reports as Record<string, string> | undefined;
  const c = dict.common as Record<string, string>;

  const pieOption = data && data.byCategory.length > 0
    ? {
        tooltip: {
          trigger: 'item' as const,
          formatter: (params: { name: string; value: number; percent: number }) =>
            `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`,
        },
        legend: {
          orient: 'vertical' as const,
          right: '5%',
          top: 'center',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
            label: { show: false },
            data: data.byCategory.map((cat) => ({
              value: cat.total,
              name: cat.name,
              itemStyle: { color: cat.color },
            })),
          },
        ],
      }
    : null;

  const barOption = data && data.byMonth.length > 0
    ? {
        tooltip: { trigger: 'axis' as const },
        legend: { data: ['Ingresos', 'Gastos'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category' as const,
          data: data.byMonth.map((m) => m.month),
        },
        yAxis: { type: 'value' as const },
        series: [
          { name: 'Ingresos', type: 'bar', data: data.byMonth.map((m) => m.income), itemStyle: { color: '#22c55e' } },
          { name: 'Gastos', type: 'bar', data: data.byMonth.map((m) => m.expenses), itemStyle: { color: '#ef4444' } },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{d?.title || 'Reportes'}</h1>

      <FadeIn>
        <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <label className="mb-1 block text-xs text-gray-500">{lang === 'es' ? 'Desde' : 'From'}</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter('from', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">{lang === 'es' ? 'Hasta' : 'To'}</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilter('to', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">{c.type || 'Tipo'}</label>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">{lang === 'es' ? 'Todos' : 'All'}</option>
              <option value="income">{c.income}</option>
              <option value="expense">{c.expense}</option>
            </select>
          </div>
        </div>
      </FadeIn>

      {data && (
        <>
          <FadeIn>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500">{c.income}</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(data.totalIncome)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500">{c.expense}</p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-500">{lang === 'es' ? 'Balance' : 'Balance'}</p>
                <p className={`mt-1 text-2xl font-bold ${data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(data.balance)}
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {pieOption && (
              <FadeIn>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="mb-4 text-lg font-semibold">
                    {lang === 'es' ? 'Gastos por categoría' : 'Expenses by category'}
                  </h2>
                  <Chart option={pieOption} height="300px" />
                </div>
              </FadeIn>
            )}

            {barOption && (
              <FadeIn>
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <h2 className="mb-4 text-lg font-semibold">
                    {lang === 'es' ? 'Ingresos vs Gastos por mes' : 'Income vs Expenses by month'}
                  </h2>
                  <Chart option={barOption} height="300px" />
                </div>
              </FadeIn>
            )}
          </div>

          <FadeIn>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold">
                {lang === 'es' ? 'Detalle de transacciones' : 'Transaction details'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800">
                      <th className="pb-2 font-medium">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                      <th className="pb-2 font-medium">{c.type || 'Tipo'}</th>
                      <th className="pb-2 font-medium">{lang === 'es' ? 'Categoría' : 'Category'}</th>
                      <th className="pb-2 font-medium">{lang === 'es' ? 'Cuenta' : 'Account'}</th>
                      <th className="pb-2 font-medium">{lang === 'es' ? 'Nota' : 'Note'}</th>
                      <th className="pb-2 text-right font-medium">{lang === 'es' ? 'Monto' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800/50">
                        <td className="py-2">
                          {new Date(tx.date).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US')}
                        </td>
                        <td className="py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${tx.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {tx.type === 'income' ? c.income : c.expense}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#6b7280' }} />
                            {tx.category?.name || '-'}
                          </div>
                        </td>
                        <td className="py-2">{tx.account?.name || '-'}</td>
                        <td className="max-w-[200px] truncate text-gray-500">{tx.note || '-'}</td>
                        <td className={`py-2 text-right font-medium ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.transactions.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    {lang === 'es' ? 'No hay transacciones en este período' : 'No transactions in this period'}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
