'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { transfers, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createTransferSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getTransfers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.query.transfers.findMany({
    where: (t, { eq }) => eq(t.userId, session.user!.id!),
    orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
    with: {
      fromAccount: true,
      toAccount: true,
    },
  });
}

export async function createTransfer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createTransferSchema.safeParse({
    fromAccountId: formData.get('fromAccountId'),
    toAccountId: formData.get('toAccountId'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    note: formData.get('note') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { fromAccountId, toAccountId, amount, date, note } = parsed.data;

  if (fromAccountId === toAccountId) {
    return { error: { form: ['Las cuentas deben ser diferentes'] } };
  }

  await db.insert(transfers).values({
    userId: session.user!.id!,
    fromAccountId,
    toAccountId,
    amount,
    date,
    note: note || null,
  });

  revalidatePath('/[lang]/transfers');
  return { success: true };
}
