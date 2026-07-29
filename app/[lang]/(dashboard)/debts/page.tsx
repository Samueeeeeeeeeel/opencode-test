import { getDebts } from '@/features/debts/actions';
import { DebtForm } from '@/features/debts/components/DebtForm';
import { DebtList } from '@/features/debts/components/DebtList';

export default async function DebtsPage() {
  const debts = await getDebts();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Deudas y préstamos</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">Nueva deuda</h2>
        <DebtForm />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus deudas</h2>
        <DebtList debts={debts} />
      </div>
    </div>
  );
}
