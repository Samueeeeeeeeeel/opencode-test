import { getGoals } from '@/features/goals/actions';
import { GoalForm } from '@/features/goals/components/GoalForm';
import { GoalList } from '@/features/goals/components/GoalList';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Metas de ahorro</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">Nueva meta</h2>
        <GoalForm />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus metas</h2>
        <GoalList goals={goals} />
      </div>
    </div>
  );
}
