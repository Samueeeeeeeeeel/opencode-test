import { getDictionary } from '@/lib/i18n';
import { hasLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{dict.dashboard.title}</h1>
      <p className="text-gray-500">{dict.common.loading}</p>
    </div>
  );
}
