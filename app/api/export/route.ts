import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateCSV, generateExcel } from '@/features/export/utils';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const type = searchParams.get('type');

  const conditions = [
    eq(transactions.userId, session.user.id!),
    eq(transactions.status, 'confirmed'),
  ];

  if (from) conditions.push(sql`${transactions.date} >= ${from}`);
  if (to) conditions.push(sql`${transactions.date} <= ${to}`);
  if (type) conditions.push(eq(transactions.type, type as 'income' | 'expense'));

  const txList = await db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.date)],
    with: { category: true, account: true },
  });

  const exportData = await Promise.all(
    txList.map(async (tx) => {
      const txTagLinks = await db.query.transactionTags.findMany({
        where: (tt, { eq }) => eq(tt.transactionId, tx.id),
        with: { tag: true },
      });

      return {
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        categoryName: tx.category?.name || 'Sin categoría',
        accountName: tx.account?.name || 'Sin cuenta',
        tags: txTagLinks.map((tt) => tt.tag?.name || ''),
        note: tx.note,
        status: tx.status,
      };
    })
  );

  if (format === 'xlsx') {
    const buffer = generateExcel(exportData);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename=aford-transacciones.xlsx',
      },
    });
  }

  const csv = generateCSV(exportData);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition':
        'attachment; filename=aford-transacciones.csv',
    },
  });
}
