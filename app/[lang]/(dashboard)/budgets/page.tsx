import { Suspense } from 'react';
import { getBudgets } from '@/features/budgets/actions';
import { getCategories } from '@/features/categories/actions';
import { BudgetForm } from '@/features/budgets/components/BudgetForm';
import { BudgetList } from '@/features/budgets/components/BudgetList';
import { MonthNav } from './MonthNav';

async function BudgetsContent({
  currentMonth,
  currentYear,
}: {
  currentMonth: number;
  currentYear: number;
}) {
  const budgets = await getBudgets(currentMonth, currentYear);
  const categories = await getCategories();
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <>
      <MonthNav month={currentMonth} year={currentYear} />

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">
          Nuevo presupuesto
        </h2>
        <BudgetForm
          categories={expenseCategories}
          month={currentMonth}
          year={currentYear}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">
          {currentMonth}/{currentYear}
        </h2>
        <BudgetList
          budgets={budgets}
          month={currentMonth}
          year={currentYear}
        />
      </div>
    </>
  );
}

export default async function BudgetsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ month?: string; year?: string }>;
}) {
  const sp = await props.searchParams;
  const now = new Date();
  const currentMonth = sp?.month ? Number(sp.month) : now.getMonth() + 1;
  const currentYear = sp?.year ? Number(sp.year) : now.getFullYear();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Presupuestos</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">Cargando...</p>}>
        <BudgetsContent currentMonth={currentMonth} currentYear={currentYear} />
      </Suspense>
    </div>
  );
}
