import { MovementForm } from '@/features/transactions/components/MovementForm';

export default async function TransactionsPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-bold text-white">Nuevo movimiento</h1>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <MovementForm />
      </div>
    </div>
  );
}
