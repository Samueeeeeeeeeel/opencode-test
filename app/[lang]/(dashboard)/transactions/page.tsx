import { getAccountsWithBalance } from '@/features/accounts/actions';
import { getCategories } from '@/features/categories/actions';
import { getTransactions } from '@/features/transactions/actions';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { InstallmentForm } from '@/features/transactions/components/InstallmentForm';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import { TransactionFilters } from './TransactionFiltersClient';

export default async function TransactionsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{
    type?: string;
    categoryId?: string;
    accountId?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const sp = await props.searchParams;
  const accounts = await getAccountsWithBalance();
  const categories = await getCategories();
  const transactions = await getTransactions({
    type: sp?.type,
    categoryId: sp?.categoryId,
    accountId: sp?.accountId,
    status: sp?.status,
    search: sp?.search,
  });

  const activeAccounts = Array.isArray(accounts)
    ? accounts.filter((a: { isActive: boolean }) => a.isActive).map((a: { id: string; name: string; color: string }) => ({ id: a.id, name: a.name, color: a.color }))
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Transacciones</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="mb-4 text-lg font-medium">
            Nueva transacción
          </h2>
          <TransactionForm
            accounts={activeAccounts}
            categories={categories}
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="mb-4 text-lg font-medium">
            Compra en cuotas
          </h2>
          <InstallmentForm
            accounts={activeAccounts}
            categories={categories}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">
          Historial de transacciones
        </h2>
        <TransactionFilters
          accounts={activeAccounts}
          categories={categories}
        />
        <div className="mt-4">
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
