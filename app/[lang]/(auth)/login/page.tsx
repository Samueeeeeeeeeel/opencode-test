import { getDictionary, hasLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Aford</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {dict.auth.login}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <LoginForm dict={dict} />
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {dict.auth.noAccount}{' '}
          <Link
            href={`/${lang}/register`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {dict.auth.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
