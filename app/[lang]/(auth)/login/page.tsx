import { getDictionary } from '@/lib/i18n';
import { hasLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold">Aford</h1>
        <p className="text-center text-gray-500">{dict.auth.login}</p>
      </div>
    </div>
  );
}
