'use client';

import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

type DashboardData = {
  totalBalance: number;
  income: number;
  expenses: number;
  credit: number;
  balance: number;
  fixedExpenses?: number;
  variableExpenses?: number;
  previousCredit?: number;
  installmentPayments?: number;
  savings?: number;
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

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${color || 'text-white'}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function MonthSelector({
  currentMonth,
  onPrev,
  onNext,
}: {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}) {
  const monthName = MONTHS_ES[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={onPrev}
        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <h1 className="text-base font-semibold text-white">
        {monthName} De {year}
      </h1>
      <button
        onClick={onNext}
        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}

export function DashboardClient({
  data,
  lang,
}: {
  data: DashboardData;
  dict: Record<string, unknown>;
  lang: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const sobrante = data.income - data.expenses - data.credit;

  return (
    <div className="mx-auto max-w-md space-y-3">
      <MonthSelector
        currentMonth={currentMonth}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      <SummaryCard label="Ingreso del mes" value={data.income} color="text-blue-500" />
      <SummaryCard label="Gastos del mes" value={data.expenses} color="text-white" />
      <SummaryCard label="Crédito / Cuotas" value={data.credit} color="text-white" />
      <SummaryCard
        label="Sobrante"
        value={sobrante}
        color={sobrante >= 0 ? 'text-blue-500' : 'text-red-400'}
      />
    </div>
  );
}
