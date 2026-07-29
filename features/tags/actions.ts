'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createTagSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getTags() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.tags.findMany({
    where: (t, { eq }) => eq(t.userId, session.user!.id!),
    orderBy: (t, { asc }) => [asc(t.name)],
  });
}

export async function createTag(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createTagSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db.insert(tags).values({
    userId: session.user!.id!,
    name: parsed.data.name,
  });

  revalidatePath('/[lang]/tags');
  return { success: true };
}

export async function deleteTag(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('tagId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, session.user!.id!)));

  revalidatePath('/[lang]/tags');
  return { success: true };
}
