'use client';

import { formatCurrency } from '@/lib/utils';
import { Chart } from '@/components/charts/Chart';
import { FadeIn } from '@/components/shared/motion';

type DashboardData = {
  totalBalance: number;
  income: number;
  expenses: number;
  balance: number;
  expenseByCategory: { name: string; value: number; color: string }[];
  last6Months: { month: string; income: number; expenses: number }[];
  balanceOverTime: { date: string; balance: number }[];
  budgets: {
    id: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    spent: number;
  }[];
  upcomingCommitments: {
    type: 'installment' | 'recurring';
    description: string;
    amount: number;
    date: string;
  }[];
};

type Dict = Record<string, unknown>;

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p
        className={`mt-1 text-2xl font-bold ${color || 'text-gray-900 dark:text-white'}`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function getPieOption(data: { name: string; value: number; color: string }[]) {
  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`,
    },
    legend: {
      orient: 'vertical' as const,
      right: '5%',
      top: 'center',
      textStyle: { fontSize: 12 },
    },
    series: [
      {
        name: 'Gastos',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'transparent',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' as const },
        },
        data: data.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };
}

function getBarOption(data: { month: string; income: number; expenses: number }[]) {
  return {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { seriesName: string; value: number; marker: string }[]) =>
        params
          .map((p) => `${p.marker} ${p.seriesName}: ${formatCurrency(p.value)}`)
          .join('<br/>'),
    },
    legend: {
      data: ['Ingresos', 'Gastos'],
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.month),
      axisLabel: {
        formatter: (val: string) => {
          const [, m] = val.split('-');
          const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          return months[parseInt(m, 10) - 1] || m;
        },
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (val: number) => {
          if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M`;
          if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
          return val.toString();
        },
      },
    },
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        data: data.map((d) => d.income),
        itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Gastos',
        type: 'bar',
        data: data.map((d) => d.expenses),
        itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
}

function getLineOption(data: { date: string; balance: number }[]) {
  return {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { value: [string, number] }[]) =>
        `${params[0]?.value[0]}: ${formatCurrency(params[0]?.value[1] || 0)}`,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: data.map((d) => d.date),
      axisLabel: {
        formatter: (val: string) => {
          const d = new Date(val);
          return `${d.getDate()}/${d.getMonth() + 1}`;
        },
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        formatter: (val: number) => {
          if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M`;
          if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
          return val.toString();
        },
      },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.balance),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59,130,246,0.3)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' },
            ],
          },
        },
        lineStyle: { color: '#3b82f6', width: 2 },
        itemStyle: { color: '#3b82f6' },
      },
    ],
  };
}


export function DashboardClient({
  data,
  dict,
  lang,
}: {
  data: DashboardData;
  dict: Dict;
  lang: string;
}) {
  const d = dict.dashboard as Record<string, string>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{d.title}</h1>

      <FadeIn>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title={d.balance} value={data.totalBalance} color="text-blue-600 dark:text-blue-400" />
          <SummaryCard title={d.income} value={data.income} color="text-green-600 dark:text-green-400" />
          <SummaryCard title={d.expenses} value={data.expenses} color="text-red-600 dark:text-red-400" />
          <SummaryCard
            title={d.balanceLabel}
            value={data.balance}
            color={data.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
          />
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FadeIn>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold">
              {lang === 'es' ? 'Gastos por categoría' : 'Expenses by category'}
            </h2>
            {data.expenseByCategory.length > 0 ? (
              <Chart option={getPieOption(data.expenseByCategory)} height="300px" />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">{d.noData}</p>
            )}
          </div>
        </FadeIn>

        <FadeIn>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold">
              {lang === 'es' ? 'Ingresos vs Gastos' : 'Income vs Expenses'}
            </h2>
            {data.last6Months.some((m) => m.income > 0 || m.expenses > 0) ? (
              <Chart option={getBarOption(data.last6Months)} height="300px" />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">{d.noData}</p>
            )}
          </div>
        </FadeIn>
      </div>

      <FadeIn>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold">
            {lang === 'es' ? 'Tendencia de saldo' : 'Balance trend'}
          </h2>
          {data.balanceOverTime.some((d) => d.balance !== 0) ? (
            <Chart option={getLineOption(data.balanceOverTime)} height="300px" />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">{d.noData}</p>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {data.budgets.length > 0 && (
          <FadeIn>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold">{d.budgetProgress}</h2>
              <div className="space-y-3">
                {data.budgets.map((b) => {
                  const pct = b.amount > 0 ? Math.min(Math.round((b.spent / b.amount) * 100), 100) : 0;
                  const barColor = pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500';
                  return (
                    <div key={b.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: b.categoryColor }} />
                          <span>{b.categoryName}</span>
                        </div>
                        <span className="text-gray-500">
                          {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {data.upcomingCommitments.length > 0 && (
          <FadeIn>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold">{d.upcomingCommitments}</h2>
              <div className="space-y-3">
                {data.upcomingCommitments.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(c.date).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
