'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createCategorySchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.categories.findMany({
    where: (c, { eq }) => eq(c.userId, session.user!.id!),
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, color, icon } = parsed.data;

  await db.insert(categories).values({
    userId: session.user!.id!,
    name,
    type,
    color,
    icon: icon || null,
  });

  revalidatePath('/[lang]/categories');
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, color, icon } = parsed.data;

  await db
    .update(categories)
    .set({ name, type, color, icon: icon || null, updatedAt: new Date() })
    .where(
      and(eq(categories.id, id), eq(categories.userId, session.user!.id!))
    );

  revalidatePath('/[lang]/categories');
  return { success: true };
}

export async function deleteCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('categoryId') as string;
  if (!id) return { error: 'ID requerido' };

  const hasTransactions = await db.query.transactions.findFirst({
    where: (t, { eq }) => eq(t.categoryId, id),
  });

  if (hasTransactions) {
    return { error: 'No puedes eliminar una categoría con transacciones' };
  }

  await db
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(eq(categories.id, id), eq(categories.userId, session.user!.id!))
    );

  revalidatePath('/[lang]/categories');
  return { success: true };
}
