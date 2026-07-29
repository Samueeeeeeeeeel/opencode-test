import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/lib/i18n';
import { getDashboardData } from '@/features/dashboard/queries';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const settings = await db.query.userSettings.findFirst({
    where: (us, { eq }) => eq(us.userId, session.user!.id!),
  });

  if (!settings?.onboardingCompleted) {
    redirect(`/${lang}/onboarding`);
  }

  const dict = await getDictionary(lang);
  const data = await getDashboardData(settings?.closingDay ?? 1);

  if (!data) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{dict.dashboard.title}</h1>
        <p className="text-gray-500">{dict.common.loading}</p>
      </div>
    );
  }

  return (
    <DashboardClient data={data} dict={dict} lang={lang} />
  );
}
