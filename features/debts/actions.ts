'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { debts, debtPayments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createDebtSchema, payDebtSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getDebts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.debts.findMany({
    where: (d, { eq }) => eq(d.userId, session.user!.id!),
    orderBy: (d, { desc }) => [desc(d.createdAt)],
  });
}

export async function createDebt(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createDebtSchema.safeParse({
    name: formData.get('name'),
    totalAmount: formData.get('totalAmount'),
    interestRate: formData.get('interestRate') || undefined,
    startDate: formData.get('startDate'),
    dueDate: formData.get('dueDate') || undefined,
    personName: formData.get('personName') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, totalAmount, interestRate, startDate, dueDate, personName } =
    parsed.data;

  await db.insert(debts).values({
    userId: session.user!.id!,
    name,
    totalAmount,
    interestRate: interestRate ? String(interestRate) : null,
    startDate,
    dueDate: dueDate || null,
    personName: personName || null,
  });

  revalidatePath('/[lang]/debts');
  return { success: true };
}

export async function payDebt(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = payDebtSchema.safeParse({
    debtId: formData.get('debtId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { debtId, amount, date, note } = parsed.data;

  const debt = await db.query.debts.findFirst({
    where: (d, { eq }) => eq(d.id, debtId),
  });

  if (!debt || debt.userId !== session.user!.id!) {
    return { error: 'No autorizado' };
  }

  await db.insert(debtPayments).values({
    debtId,
    amount,
    date,
    note: note || null,
  });

  const newPaid = debt.paidAmount + amount;

  if (newPaid >= debt.totalAmount) {
    await db
      .update(debts)
      .set({
        paidAmount: debt.totalAmount,
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(debts.id, debtId));
  } else {
    await db
      .update(debts)
      .set({ paidAmount: newPaid, updatedAt: new Date() })
      .where(eq(debts.id, debtId));
  }

  revalidatePath('/[lang]/debts');
  return { success: true };
}

export async function deleteDebt(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('debtId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .update(debts)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(debts.id, id), eq(debts.userId, session.user!.id!)));

  revalidatePath('/[lang]/debts');
  return { success: true };
}
