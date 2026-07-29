import { getCategories } from '@/features/categories/actions';
import { CategoryList } from '@/features/categories/components/CategoryList';
import { CategoryForm } from '@/features/categories/components/CategoryForm';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Categorías</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">Nueva categoría</h2>
        <CategoryForm />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus categorías</h2>
        <CategoryList categories={categories} />
      </div>
    </div>
  );
}
