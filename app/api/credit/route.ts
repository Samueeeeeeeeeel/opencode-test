import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { installments, transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all active installments for the user
  const activeInstallments = await db.query.installments.findMany({
    where: eq(installments.userId, userId),
    with: { category: true, account: true },
    orderBy: (i, { desc }) => [desc(i.startDate)],
  });

  // Get paid count for each installment
  const installmentsWithPaidCount = await Promise.all(
    activeInstallments.map(async (inst) => {
      const paidResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.installmentId, inst.id),
            eq(transactions.status, 'confirmed')
          )
        );

      const paidCount = Number(paidResult[0]?.count ?? 0);

      return {
        id: inst.id,
        totalAmount: inst.totalAmount,
        numberOfInstallments: inst.numberOfInstallments,
        installmentValue: inst.installmentValue,
        startDate: inst.startDate,
        status: inst.status,
        note: inst.note,
        category: inst.category ? { name: inst.category.name, color: inst.category.color } : null,
        account: inst.account ? { name: inst.account.name } : null,
        paidCount,
      };
    })
  );

  // Filter only active installments
  const active = installmentsWithPaidCount.filter((i) => i.status === 'active');

  // Calculate totals
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalThisMonth = 0;
  let totalRemaining = 0;

  active.forEach((inst) => {
    const startDate = new Date(inst.startDate + 'T12:00:00');
    const monthsElapsed =
      (currentYear - startDate.getFullYear()) * 12 +
      (currentMonth - startDate.getMonth());
    const remainingInstallments = inst.numberOfInstallments - inst.paidCount;

    if (remainingInstallments > 0) {
      totalThisMonth += inst.installmentValue;
      totalRemaining += inst.installmentValue * remainingInstallments;
    }
  });

  return NextResponse.json({
    installments: active,
    totalThisMonth,
    totalRemaining,
  });
}
