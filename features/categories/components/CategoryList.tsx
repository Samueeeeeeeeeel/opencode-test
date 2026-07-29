'use client';

import { deleteCategory } from '../actions';
import { useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string | null;
  isActive: boolean;
};

function Section({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: Category[];
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-400">Sin categorías</p>
        )}
        {items.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
            <button
              onClick={() => onDelete(cat.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Archivar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter();

  async function handleDelete(categoryId: string) {
    const fd = new FormData();
    fd.set('categoryId', categoryId);
    await deleteCategory(fd);
    router.refresh();
  }

  const income = categories.filter((c) => c.type === 'income');
  const expense = categories.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6">
      <Section title="Ingresos" items={income} onDelete={handleDelete} />
      <Section title="Gastos" items={expense} onDelete={handleDelete} />
    </div>
  );
}
