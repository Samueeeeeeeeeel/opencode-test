'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import {
  transactions,
  installments,
  transactionTags,
  installmentTags,
  bankAccounts,
  categories,
  userSettings,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import {
  createTransactionSchema,
  createInstallmentSchema,
} from './schemas';
import { revalidatePath } from 'next/cache';

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentación', color: '#ef4444' },
  { name: 'Transporte', color: '#f59e0b' },
  { name: 'Vivienda', color: '#3b82f6' },
  { name: 'Servicios', color: '#8b5cf6' },
  { name: 'Salud', color: '#10b981' },
  { name: 'Educación', color: '#ec4899' },
  { name: 'Entretención', color: '#14b8a6' },
  { name: 'Ropa', color: '#f97316' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Sueldo', color: '#3b82f6' },
  { name: 'Freelance', color: '#10b981' },
  { name: 'Inversiones', color: '#8b5cf6' },
  { name: 'Otros', color: '#6b7280' },
];

async function ensureDefaults(userId: string) {
  const existingAccount = await db.query.bankAccounts.findFirst({
    where: (a, { eq }) => eq(a.userId, userId),
  });

  if (!existingAccount) {
    await db.insert(bankAccounts).values({
      userId,
      name: 'Mi cuenta',
      type: 'checking',
      color: '#3b82f6',
    });

    await db.insert(userSettings).values({
      userId,
      closingDay: 1,
      theme: 'dark',
      language: 'es',
      onboardingCompleted: true,
    }).onConflictDoNothing();
  }

  const existingCategory = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.userId, userId),
  });

  if (!existingCategory) {
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      await db.insert(categories).values({
        userId,
        name: cat.name,
        type: 'expense',
        color: cat.color,
      });
    }
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      await db.insert(categories).values({
        userId,
        name: cat.name,
        type: 'income',
        color: cat.color,
      });
    }
  }
}

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

export async function getTransactions(
  filters?: {
    type?: string;
    categoryId?: string;
    accountId?: string;
    status?: string;
    from?: string;
    to?: string;
    search?: string;
  },
  page = 1,
  pageSize = 20
) {
  const session = await auth();
  if (!session?.user?.id) return { transactions: [], total: 0 };

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

  const where = and(...conditions);
  const offset = (page - 1) * pageSize;

  const [results, countResult] = await Promise.all([
    db.query.transactions.findMany({
      where,
      orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
      with: { account: true, category: true },
      limit: pageSize,
      offset,
    }),
    db.select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where),
  ]);

  return {
    transactions: results,
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / pageSize),
  };
}

export async function createTransaction(formData: FormData) {
  try {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  await ensureDefaults(session.user!.id!);

  const tagIdsRaw = formData.get('tagIds');
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw as string) : [];

  let accountId = formData.get('accountId') as string || '';
  let categoryId = formData.get('categoryId') as string || '';

  // Auto-assign default account if not provided
  if (!accountId) {
    const defaultAccount = await db.query.bankAccounts.findFirst({
      where: (a, { eq }) => eq(a.userId, session.user!.id!),
    });
    accountId = defaultAccount?.id || '';
  }

  // Auto-assign default category if not provided
  if (!categoryId) {
    const type = formData.get('type') as string;
    const defaultCategory = await db.query.categories.findFirst({
      where: (c, { and, eq }) => and(eq(c.userId, session.user!.id!), eq(c.type, type as 'income' | 'expense')),
    });
    categoryId = defaultCategory?.id || '';
  }

  if (!accountId || !categoryId) {
    return { error: { form: ['Necesitas crear al menos una cuenta y una categoría'] } };
  }

  const parsed = createTransactionSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    accountId,
    categoryId,
    date: formData.get('date'),
    status: formData.get('status') || 'confirmed',
    note: formData.get('note') || undefined,
    tagIds,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { type, amount, date, status, note } = parsed.data;

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
  } catch (e) {
    console.error('createTransaction error:', e);
    return { error: { form: [e instanceof Error ? e.message : 'Error inesperado'] } };
  }
}

export async function confirmTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('transactionId') as string;
  const clientVersion = formData.get('version');
  if (!id) return { error: 'ID requerido' };

  const tx = await db.query.transactions.findFirst({
    where: (t, { eq }) => eq(t.id, id),
  });

  if (!tx || tx.userId !== session.user!.id!) {
    return { error: 'No autorizado' };
  }

  if (clientVersion !== null && clientVersion !== undefined) {
    const expectedVersion = Number(clientVersion);
    if (tx.version !== expectedVersion) {
      return { error: 'conflict', message: 'La transacción fue modificada por otro usuario. Recarga la página.' };
    }
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

  const [updated] = await db
    .update(transactions)
    .set({ status: 'confirmed', updatedAt: new Date(), version: tx.version + 1 })
    .where(and(eq(transactions.id, id), eq(transactions.version, tx.version)))
    .returning();

  if (!updated) {
    return { error: 'conflict', message: 'Conflicto de concurrencia. Recarga la página.' };
  }

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

  const [updated] = await db
    .update(transactions)
    .set({ status: 'pending', updatedAt: new Date(), version: tx.version + 1 })
    .where(and(eq(transactions.id, id), eq(transactions.version, tx.version)))
    .returning();

  if (!updated) {
    return { error: 'conflict', message: 'Conflicto de concurrencia. Recarga la página.' };
  }

  revalidatePath('/[lang]/transactions');
  return { success: true };
}

export async function createInstallmentTransaction(formData: FormData) {
  try {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  await ensureDefaults(session.user!.id!);

  const tagIdsRaw = formData.get('tagIds');
  const tagIds = tagIdsRaw ? JSON.parse(tagIdsRaw as string) : [];

  let accountId = formData.get('accountId') as string || '';
  let categoryId = formData.get('categoryId') as string || '';

  // Auto-assign default account if not provided
  if (!accountId) {
    const defaultAccount = await db.query.bankAccounts.findFirst({
      where: (a, { eq }) => eq(a.userId, session.user!.id!),
    });
    accountId = defaultAccount?.id || '';
  }

  // Auto-assign default category if not provided
  if (!categoryId) {
    const defaultCategory = await db.query.categories.findFirst({
      where: (c, { and, eq }) => and(eq(c.userId, session.user!.id!), eq(c.type, 'expense')),
    });
    categoryId = defaultCategory?.id || '';
  }

  if (!accountId || !categoryId) {
    return { error: { form: ['Necesitas crear al menos una cuenta y una categoría'] } };
  }

  const parsed = createInstallmentSchema.safeParse({
    type: formData.get('type'),
    totalAmount: formData.get('totalAmount'),
    accountId,
    categoryId,
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
  } catch (e) {
    console.error('createInstallmentTransaction error:', e);
    return { error: { form: [e instanceof Error ? e.message : 'Error inesperado'] } };
  }
}
