'use client';

import { deleteTag } from '../actions';
import { useRouter } from 'next/navigation';

type Tag = { id: string; name: string };

export function TagList({ tags }: { tags: Tag[] }) {
  const router = useRouter();

  async function handleDelete(tagId: string) {
    const fd = new FormData();
    fd.set('tagId', tagId);
    await deleteTag(fd);
    router.refresh();
  }

  if (tags.length === 0) {
    return <p className="text-sm text-gray-500">Sin etiquetas</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
        >
          <span>{tag.name}</span>
          <button
            onClick={() => handleDelete(tag.id)}
            className="text-gray-400 hover:text-red-500"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
