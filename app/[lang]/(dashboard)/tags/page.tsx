import { getTags } from '@/features/tags/actions';
import { TagList } from '@/features/tags/components/TagList';
import { TagForm } from '@/features/tags/components/TagForm';

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Etiquetas</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-medium">Nueva etiqueta</h2>
        <TagForm />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Tus etiquetas</h2>
        <TagList tags={tags} />
      </div>
    </div>
  );
}
