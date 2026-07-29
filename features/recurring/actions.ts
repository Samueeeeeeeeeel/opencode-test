'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import {
  recurringTransactions,
  transactions,
  recurringTags,
} from '@/lib/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { createRecurringSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getRecurringTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.recurringTransactions.findMany({
    where: (r, { eq }) => eq(r.userId, session.user!.id!),
    orderBy: (r, { asc }) => [asc(r.nextExecution)],
    with: { account: true, category: true },
  });
}

export async function createRecurringTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createRecurringSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId'),
    frequency: formData.get('frequency'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate') || undefined,
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, accountId, categoryId, frequency, startDate, endDate, note } =
    parsed.data;

  await db.insert(recurringTransactions).values({
    userId: session.user!.id!,
    accountId,
    categoryId,
    type,
    amount,
    frequency,
    startDate,
    endDate: endDate || null,
    nextExecution: startDate,
    note: note || null,
  });

  revalidatePath('/[lang]/recurring');
  return { success: true };
}

export async function deleteRecurringTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('recurringId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .update(recurringTransactions)
    .set({ isActive: false })
    .where(
      and(
        eq(recurringTransactions.id, id),
        eq(recurringTransactions.userId, session.user!.id!)
      )
    );

  revalidatePath('/[lang]/recurring');
  return { success: true };
}

export async function processRecurringTransactions() {
  const session = await auth();
  if (!session?.user?.id) return;

  const due = await db.query.recurringTransactions.findMany({
    where: (r, { eq, and }) =>
      and(
        eq(r.userId, session.user!.id!),
        eq(r.isActive, true),
        lte(r.nextExecution, new Date().toISOString().split('T')[0])
      ),
  });

  for (const r of due) {
    await db.insert(transactions).values({
      userId: r.userId,
      accountId: r.accountId,
      categoryId: r.categoryId,
      type: r.type,
      amount: r.amount,
      date: r.nextExecution,
      status: 'pending',
      recurringId: r.id,
      note: r.note,
    });

    const nextDate = new Date(r.nextExecution);
    switch (r.frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    const nextStr = nextDate.toISOString().split('T')[0];

    if (r.endDate && nextStr > r.endDate) {
      await db
        .update(recurringTransactions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(recurringTransactions.id, r.id));
    } else {
      await db
        .update(recurringTransactions)
        .set({ nextExecution: nextStr, updatedAt: new Date() })
        .where(eq(recurringTransactions.id, r.id));
    }
  }

  revalidatePath('/[lang]/recurring');
}
