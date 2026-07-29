import { auth } from '@/features/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/lib/i18n';
import { getReportData } from '@/features/reports/queries';
import { ReportsClient } from './ReportsClient';

export default async function ReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const dict = await getDictionary(lang);

  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultTo = now.toISOString().split('T')[0];

  const filters = {
    from: (sp.from as string) || defaultFrom,
    to: (sp.to as string) || defaultTo,
    type: sp.type as string | undefined,
    categoryId: sp.categoryId as string | undefined,
    accountId: sp.accountId as string | undefined,
  };

  const data = await getReportData(filters);

  return (
    <ReportsClient data={data} dict={dict} lang={lang} initialFilters={filters} />
  );
}
