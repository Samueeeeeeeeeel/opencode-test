'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import {
  transactions,
  categories,
} from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getFinancialMonth } from './utils';

export async function getDashboardData(closingDay: number = 1) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id!;
  const { start: monthStart, end: monthEnd } = getFinancialMonth(closingDay);

  const startStr = monthStart.toISOString().split('T')[0];
  const endStr = monthEnd.toISOString().split('T')[0];

  const totalBalance = await db
    .select({
      balance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
    })
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), eq(transactions.status, 'confirmed'))
    );

  const monthSummary = await db
    .select({
      type: transactions.type,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, 'confirmed'),
        sql`${transactions.date} >= ${startStr}`,
        sql`${transactions.date} <= ${endStr}`
      )
    )
    .groupBy(transactions.type);

  const income =
    monthSummary.find((r) => r.type === 'income')?.total ?? 0;
  const expenses =
    monthSummary.find((r) => r.type === 'expense')?.total ?? 0;

  const expenseByCategory = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        eq(transactions.status, 'confirmed'),
        sql`${transactions.date} >= ${startStr}`,
        sql`${transactions.date} <= ${endStr}`
      )
    )
    .groupBy(transactions.categoryId, categories.name, categories.color);

  const last6Months: { month: string; income: number; expenses: number }[] =
    [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const mStart = `${y}-${String(m).padStart(2, '0')}-01`;
    const mEnd = new Date(y, m, 0);
    const mEndStr = mEnd.toISOString().split('T')[0];

    const result = await db
      .select({
        type: transactions.type,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, 'confirmed'),
          sql`${transactions.date} >= ${mStart}`,
          sql`${transactions.date} <= ${mEndStr}`
        )
      )
      .groupBy(transactions.type);

    const inc = result.find((r) => r.type === 'income')?.total ?? 0;
    const exp = result.find((r) => r.type === 'expense')?.total ?? 0;

    last6Months.push({
      month: `${y}-${String(m).padStart(2, '0')}`,
      income: inc,
      expenses: exp,
    });
  }

  const balanceOverTime: { date: string; balance: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];

    const result = await db
      .select({
        balance: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, 'confirmed'),
          sql`${transactions.date} <= ${dayStr}`
        )
      );

    balanceOverTime.push({
      date: dayStr,
      balance: result[0]?.balance ?? 0,
    });
  }

  const budgetData = await db.query.budgets.findMany({
    where: (b, { eq, and }) =>
      and(
        eq(b.userId, userId),
        eq(b.month, monthStart.getMonth() + 1),
        eq(b.year, monthStart.getFullYear())
      ),
    with: { category: true },
  });

  let budgetSpent: { categoryId: string; total: number }[] = [];
  if (budgetData.length > 0) {
    const catIds = budgetData.map((b) => b.categoryId);
    budgetSpent = await db
      .select({
        categoryId: transactions.categoryId,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          eq(transactions.status, 'confirmed'),
          sql`${transactions.date} >= ${startStr}`,
          sql`${transactions.date} <= ${endStr}`,
          sql`${transactions.categoryId} IN ${catIds}`
        )
      )
      .groupBy(transactions.categoryId);
  }

  const spentMap = new Map(budgetSpent.map((r) => [r.categoryId, r.total]));
  const budgetsFormatted = budgetData.map((b) => ({
    id: b.id,
    categoryName: b.category?.name || 'Sin categoría',
    categoryColor: b.category?.color || '#6b7280',
    amount: b.amount,
    spent: spentMap.get(b.categoryId) ?? 0,
  }));

  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  const futureStr = thirtyDaysLater.toISOString().split('T')[0];

  const upcomingInstallments = await db.query.installments.findMany({
    where: (i, { eq, and }) =>
      and(
        eq(i.userId, userId),
        eq(i.status, 'active'),
        sql`${i.startDate} <= ${futureStr}`
      ),
    with: { category: true, account: true },
    orderBy: (i, { asc }) => [asc(i.startDate)],
    limit: 10,
  });

  const upcomingRecurring = await db.query.recurringTransactions.findMany({
    where: (r, { eq, and }) =>
      and(
        eq(r.userId, userId),
        eq(r.isActive, true),
        sql`${r.nextExecution} <= ${futureStr}`
      ),
    with: { category: true, account: true },
    orderBy: (r, { asc }) => [asc(r.nextExecution)],
    limit: 10,
  });

  return {
    totalBalance: totalBalance[0]?.balance ?? 0,
    income,
    expenses,
    balance: income - expenses,
    expenseByCategory: expenseByCategory.map((e) => ({
      name: e.categoryName,
      value: e.total,
      color: e.categoryColor,
    })),
    last6Months,
    balanceOverTime,
    budgets: budgetsFormatted,
    upcomingCommitments: [
      ...upcomingInstallments.map((i) => ({
        type: 'installment' as const,
        description: `${i.category?.name || 'Cuota'} - ${i.account?.name || ''}`,
        amount: i.installmentValue,
        date: i.startDate,
      })),
      ...upcomingRecurring.map((r) => ({
        type: 'recurring' as const,
        description: `${r.category?.name || 'Recurrente'} - ${r.account?.name || ''}`,
        amount: r.amount,
        date: r.nextExecution,
      })),
    ]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10),
  };
}
