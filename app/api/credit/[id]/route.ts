import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { installments, transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  const installment = await db.query.installments.findFirst({
    where: and(
      eq(installments.id, id),
      eq(installments.userId, session.user.id)
    ),
    with: { category: true, account: true },
  });

  if (!installment) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  }

  // Get payments for this installment
  const payments = await db.query.transactions.findMany({
    where: and(
      eq(transactions.installmentId, id),
      eq(transactions.status, 'confirmed')
    ),
    orderBy: (t, { asc }) => [asc(t.date)],
  });

  const paidCount = payments.length;

  return NextResponse.json({
    id: installment.id,
    totalAmount: installment.totalAmount,
    numberOfInstallments: installment.numberOfInstallments,
    installmentValue: installment.installmentValue,
    startDate: installment.startDate,
    status: installment.status,
    note: installment.note,
    category: installment.category
      ? { name: installment.category.name, color: installment.category.color }
      : null,
    account: installment.account ? { name: installment.account.name } : null,
    paidCount,
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      date: p.date,
      status: p.status,
    })),
  });
}
