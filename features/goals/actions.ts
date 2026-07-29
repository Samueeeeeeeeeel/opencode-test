'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { goals, goalTransactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createGoalSchema, addFundsSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getGoals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.goals.findMany({
    where: (g, { eq }) => eq(g.userId, session.user!.id!),
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });
}

export async function createGoal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createGoalSchema.safeParse({
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate') || undefined,
    accountId: formData.get('accountId') || undefined,
    color: formData.get('color') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, targetAmount, targetDate, accountId, color } = parsed.data;

  await db.insert(goals).values({
    userId: session.user!.id!,
    name,
    targetAmount,
    targetDate: targetDate || null,
    accountId: accountId || null,
    color: color || '#3b82f6',
  });

  revalidatePath('/[lang]/goals');
  return { success: true };
}

export async function addFunds(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = addFundsSchema.safeParse({
    goalId: formData.get('goalId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { goalId, amount, date, note } = parsed.data;

  const goal = await db.query.goals.findFirst({
    where: (g, { eq }) => eq(g.id, goalId),
  });

  if (!goal || goal.userId !== session.user!.id!) {
    return { error: 'No autorizado' };
  }

  await db.insert(goalTransactions).values({
    goalId,
    amount,
    date,
    note: note || null,
  });

  await db
    .update(goals)
    .set({
      currentAmount: goal.currentAmount + amount,
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId));

  if (goal.currentAmount + amount >= goal.targetAmount) {
    await db
      .update(goals)
      .set({
        status: 'completed',
        currentAmount: goal.currentAmount + amount,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, goalId));
  }

  revalidatePath('/[lang]/goals');
  return { success: true };
}

export async function deleteGoal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('goalId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .update(goals)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, session.user!.id!)));

  revalidatePath('/[lang]/goals');
  return { success: true };
}
