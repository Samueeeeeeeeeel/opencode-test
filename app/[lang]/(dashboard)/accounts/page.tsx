import { getAccountsWithBalance } from '@/features/accounts/actions';
import { AccountList } from '@/features/accounts/components/AccountList';
import { AccountForm } from '@/features/accounts/components/AccountForm';

export default async function AccountsPage() {
  const accounts = await getAccountsWithBalance();

  if ('error' in accounts) {
    return <p className="text-red-500">Error al cargar cuentas</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Cuentas</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">Nueva cuenta</h2>
        <AccountForm />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus cuentas</h2>
        <AccountList accounts={accounts} />
      </div>
    </div>
  );
}
