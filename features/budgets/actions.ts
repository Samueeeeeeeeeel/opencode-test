'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { budgets, transactions } from '@/lib/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { createBudgetSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getBudgets(month?: number, year?: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  const m = month || now.getMonth() + 1;
  const y = year || now.getFullYear();

  const budgetList = await db.query.budgets.findMany({
    where: (b, { eq, and }) =>
      and(
        eq(b.userId, session.user!.id!),
        eq(b.month, m),
        eq(b.year, y)
      ),
    with: { category: true },
  });

  if (budgetList.length === 0) return [];

  const categoryIds = budgetList.map((b) => b.categoryId);

  const spentData = await db
    .select({
      categoryId: transactions.categoryId,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, session.user!.id!),
        eq(transactions.type, 'expense'),
        eq(transactions.status, 'confirmed'),
        sql`EXTRACT(MONTH FROM ${transactions.date}) = ${m}`,
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${y}`,
        inArray(transactions.categoryId, categoryIds)
      )
    )
    .groupBy(transactions.categoryId);

  const spentMap = new Map(spentData.map((r) => [r.categoryId, r.total]));

  return budgetList.map((b) => ({
    ...b,
    spent: spentMap.get(b.categoryId) ?? 0,
  }));
}

export async function createBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createBudgetSchema.safeParse({
    categoryId: formData.get('categoryId'),
    amount: formData.get('amount'),
    month: formData.get('month'),
    year: formData.get('year'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { categoryId, amount, month, year } = parsed.data;

  const existing = await db.query.budgets.findFirst({
    where: (b, { eq, and }) =>
      and(
        eq(b.userId, session.user!.id!),
        eq(b.categoryId, categoryId),
        eq(b.month, month),
        eq(b.year, year)
      ),
  });

  if (existing) {
    await db
      .update(budgets)
      .set({ amount, updatedAt: new Date() })
      .where(eq(budgets.id, existing.id));
  } else {
    await db.insert(budgets).values({
      userId: session.user!.id!,
      categoryId,
      amount,
      month,
      year,
    });
  }

  revalidatePath('/[lang]/budgets');
  return { success: true };
}

export async function deleteBudget(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('budgetId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .delete(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, session.user!.id!)));

  revalidatePath('/[lang]/budgets');
  return { success: true };
}
