import { getAccountsWithBalance } from '@/features/accounts/actions';
import { getTransfers } from '@/features/transfers/actions';
import { TransferForm } from '@/features/transfers/components/TransferForm';
import { TransferList } from '@/features/transfers/components/TransferList';

export default async function TransfersPage() {
  const accounts = await getAccountsWithBalance();
  const transfers = await getTransfers();

  const activeAccounts = Array.isArray(accounts)
    ? accounts.filter((a: { isActive: boolean }) => a.isActive)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Transferencias</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">
          Nueva transferencia
        </h2>
        <TransferForm accounts={activeAccounts} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">
          Historial de transferencias
        </h2>
        <TransferList transfers={transfers} />
      </div>
    </div>
  );
}
