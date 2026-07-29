'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import {
  transactions,
  installments,
  transactionTags,
  installmentTags,
  bankAccounts,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  createTransactionSchema,
  createInstallmentSchema,
} from './schemas';
import { revalidatePath } from 'next/cache';

async function getAccountBalance(
  userId: string,
  accountId: string
): Promise<number> {
  const result = await db
    .select({
      balance:
        sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.accountId, accountId),
        eq(transactions.userId, userId),
        eq(transactions.status, 'confirmed')
      )
    );

  return result[0]?.balance ?? 0;
}

export async function getTransactions(filters?: {
  type?: string;
  categoryId?: string;
  accountId?: string;
  status?: string;
  from?: string;
  to?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const conditions = [eq(transactions.userId, session.user!.id!)];

  if (filters?.type) conditions.push(eq(transactions.type, filters.type as 'income' | 'expense'));
  if (filters?.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters?.accountId) conditions.push(eq(transactions.accountId, filters.accountId));
  if (filters?.status) conditions.push(eq(transactions.status, filters.status as 'confirmed' | 'pending'));
  if (filters?.from) conditions.push(sql`${transactions.date} >= ${filters.from}`);
  if (filters?.to) conditions.push(sql`${transactions.date} <= ${filters.to}`);
  if (filters?.search) {
    conditions.push(
      sql`(${transactions.note} ILIKE ${'%' + filters.search + '%'})`
    );
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
    with: {
      account: true,
      category: true,
    },
  });
}

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const tagIdsRaw = formData.get('tagIds');
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw as string) : [];

  const parsed = createTransactionSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId'),
    date: formData.get('date'),
    status: formData.get('status') || 'confirmed',
    note: formData.get('note') || undefined,
    tagIds,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, accountId, categoryId, date, status, note } =
    parsed.data;

  if (status === 'confirmed' && type === 'expense') {
    const balance = await getAccountBalance(
      session.user!.id!,
      accountId
    );
    if (balance - amount < 0) {
      return {
        error: { form: ['Saldo insuficiente en la cuenta'] },
      };
    }
  }

  const [tx] = await db
    .insert(transactions)
    .values({
      userId: session.user!.id!,
      accountId,
      categoryId,
      type,
      amount,
      date,
      status,
      note: note || null,
    })
    .returning();

  if (tagIds.length > 0) {
    await db.insert(transactionTags).values(
      tagIds.map((tagId: string) => ({
        transactionId: tx.id,
        tagId,
      }))
    );
  }

  revalidatePath('/[lang]/transactions');
  return { success: true, transaction: tx };
}

export async function confirmTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('transactionId') as string;
  if (!id) return { error: 'ID requerido' };

  const tx = await db.query.transactions.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });

  if (!tx || tx.userId !== session.user!.id!) {
    return { error: 'No autorizado' };
  }

  if (tx.type === 'expense') {
    const balance = await getAccountBalance(
      session.user!.id!,
      tx.accountId
    );
    if (balance - tx.amount < 0) {
      return {
        error: { form: ['Saldo insuficiente en la cuenta'] },
      };
    }
  }

  await db
    .update(transactions)
    .set({ status: 'confirmed', updatedAt: new Date(), version: tx.version + 1 })
    .where(eq(transactions.id, id));

  revalidatePath('/[lang]/transactions');
  return { success: true };
}

export async function softDeleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('transactionId') as string;
  if (!id) return { error: 'ID requerido' };

  const tx = await db.query.transactions.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });

  if (!tx || tx.userId !== session.user!.id!) {
    return { error: 'No autorizado' };
  }

  await db
    .update(transactions)
    .set({ status: 'pending', updatedAt: new Date(), version: tx.version + 1 })
    .where(eq(transactions.id, id));

  revalidatePath('/[lang]/transactions');
  return { success: true };
}

export async function createInstallmentTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const tagIdsRaw = formData.get('tagIds');
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw as string) : [];

  const parsed = createInstallmentSchema.safeParse({
    type: formData.get('type'),
    totalAmount: formData.get('totalAmount'),
    accountId: formData.get('accountId'),
    categoryId: formData.get('categoryId'),
    numberOfInstallments: formData.get('numberOfInstallments'),
    startDate: formData.get('startDate'),
    note: formData.get('note') || undefined,
    tagIds,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const {
    totalAmount,
    accountId,
    categoryId,
    numberOfInstallments,
    startDate,
    note,
  } = parsed.data;

  const installmentValue = Math.floor(totalAmount / numberOfInstallments);
  const remainder = totalAmount - installmentValue * numberOfInstallments;

  const balance = await getAccountBalance(session.user!.id!, accountId);
  if (balance - installmentValue < 0) {
    return {
      error: { form: ['Saldo insuficiente para la primera cuota'] },
    };
  }

  const [installment] = await db
    .insert(installments)
    .values({
      userId: session.user!.id!,
      accountId,
      categoryId,
      totalAmount,
      numberOfInstallments,
      installmentValue,
      startDate,
      note: note || null,
    })
    .returning();

  const txValues = [];
  for (let i = 0; i < numberOfInstallments; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const amount = i === numberOfInstallments - 1
      ? installmentValue + remainder
      : installmentValue;

    txValues.push({
      userId: session.user!.id!,
      accountId,
      categoryId,
      type: 'expense' as const,
      amount,
      date: `${y}-${m}-${d}`,
      status: i === 0 ? 'confirmed' as const : 'pending' as const,
      installmentId: installment.id,
      note: note ? `${note} (cuota ${i + 1}/${numberOfInstallments})` : `Cuota ${i + 1}/${numberOfInstallments}`,
    });
  }

  const inserted = await db.insert(transactions).values(txValues).returning();

  if (tagIds.length > 0) {
    await db.insert(installmentTags).values(
      tagIds.map((tagId: string) => ({
        installmentId: installment.id,
        tagId,
      }))
    );
  }

  revalidatePath('/[lang]/transactions');
  return { success: true, installment };
}
