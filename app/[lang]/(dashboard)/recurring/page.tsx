import { getRecurringTransactions } from '@/features/recurring/actions';
import { getAccountsWithBalance } from '@/features/accounts/actions';
import { getCategories } from '@/features/categories/actions';
import { RecurringForm } from '@/features/recurring/components/RecurringForm';
import { RecurringList } from '@/features/recurring/components/RecurringList';

export default async function RecurringPage() {
  const [recurring, accounts, categories] = await Promise.all([
    getRecurringTransactions(),
    getAccountsWithBalance(),
    getCategories(),
  ]);

  const activeAccounts = Array.isArray(accounts)
    ? accounts.filter((a: { isActive: boolean }) => a.isActive)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">
        Transacciones recurrentes
      </h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">
          Nueva recurrencia
        </h2>
        <RecurringForm
          accounts={activeAccounts}
          categories={categories}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus recurrencias</h2>
        <RecurringList recurring={recurring} />
      </div>
    </div>
  );
}
