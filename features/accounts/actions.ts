'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { bankAccounts, transactions as tx } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createAccountSchema, type CreateAccountInput } from './schemas';
import { revalidatePath } from 'next/cache';

export async function getAccountsWithBalance() {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const accounts = await db.query.bankAccounts.findMany({
    where: (ba, { eq }) => eq(ba.userId, session.user!.id!),
    orderBy: (ba, { asc }) => [asc(ba.name)],
  });

  const balanceData = await db
    .select({
      accountId: tx.accountId,
      balance: sql<number>`SUM(CASE WHEN ${tx.type} = 'income' THEN ${tx.amount} ELSE -${tx.amount} END)`,
    })
    .from(tx)
    .where(
      and(eq(tx.userId, session.user!.id!), eq(tx.status, 'confirmed'))
    )
    .groupBy(tx.accountId);

  const balanceMap = new Map(
    balanceData.map((r) => [r.accountId, r.balance ?? 0])
  );

  return accounts.map((a) => ({
    ...a,
    balance: balanceMap.get(a.id) ?? 0,
  }));
}

export async function createAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createAccountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, color, icon } = parsed.data as CreateAccountInput;

  await db.insert(bankAccounts).values({
    userId: session.user!.id!,
    name,
    type,
    color,
    icon: icon || null,
  });

  revalidatePath('/[lang]/accounts');
  return { success: true };
}

export async function updateAccount(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = createAccountSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color'),
    icon: formData.get('icon') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, type, color, icon } = parsed.data as CreateAccountInput;

  await db
    .update(bankAccounts)
    .set({
      name,
      type,
      color,
      icon: icon || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(bankAccounts.id, id),
        eq(bankAccounts.userId, session.user!.id!)
      )
    );

  revalidatePath('/[lang]/accounts');
  return { success: true };
}

export async function deleteAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const id = formData.get('accountId') as string;
  if (!id) return { error: 'ID requerido' };

  await db
    .update(bankAccounts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(
        eq(bankAccounts.id, id),
        eq(bankAccounts.userId, session.user!.id!)
      )
    );

  revalidatePath('/[lang]/accounts');
  return { success: true };
}
