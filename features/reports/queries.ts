'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function getReportData(filters?: {
  from?: string;
  to?: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id!;
  const conditions = [eq(transactions.userId, userId), eq(transactions.status, 'confirmed')];

  if (filters?.from) conditions.push(sql`${transactions.date} >= ${filters.from}`);
  if (filters?.to) conditions.push(sql`${transactions.date} <= ${filters.to}`);
  if (filters?.type) conditions.push(eq(transactions.type, filters.type as 'income' | 'expense'));
  if (filters?.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters?.accountId) conditions.push(eq(transactions.accountId, filters.accountId));

  const allTx = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.date)],
    with: { category: true, account: true },
  });

  const totalIncome = allTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = allTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const byCategory: Record<string, { name: string; color: string; total: number }> = {};
  for (const tx of allTx) {
    if (tx.type === 'expense') {
      const key = tx.categoryId;
      if (!byCategory[key]) {
        byCategory[key] = {
          name: tx.category?.name || 'Sin categoría',
          color: tx.category?.color || '#6b7280',
          total: 0,
        };
      }
      byCategory[key].total += tx.amount;
    }
  }

  const byMonth: Record<string, { income: number; expenses: number }> = {};
  for (const tx of allTx) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0 };
    if (tx.type === 'income') {
      byMonth[key].income += tx.amount;
    } else {
      byMonth[key].expenses += tx.amount;
    }
  }

  return {
    transactions: allTx,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
    byMonth: Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data })),
  };
}
