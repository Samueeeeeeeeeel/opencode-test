import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/lib/i18n';
import { getDashboardData } from '@/features/dashboard/queries';
import { DashboardClient } from './DashboardClient';
import { bankAccounts, categories, userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function ensureDefaults(userId: string) {
  const existingAccount = await db.query.bankAccounts.findFirst({
    where: (a, { eq }) => eq(a.userId, userId),
  });

  if (!existingAccount) {
    await db.insert(bankAccounts).values({
      userId,
      name: 'Mi cuenta',
      type: 'checking',
      color: '#3b82f6',
    });
    await db.insert(userSettings).values({
      userId,
      closingDay: 1,
      theme: 'dark',
      language: 'es',
      onboardingCompleted: true,
    }).onConflictDoNothing();
  }

  const existingCategory = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.userId, userId),
  });

  if (!existingCategory) {
    const defaults = [
      { name: 'Alimentación', type: 'expense' as const, color: '#ef4444' },
      { name: 'Transporte', type: 'expense' as const, color: '#f59e0b' },
      { name: 'Vivienda', type: 'expense' as const, color: '#3b82f6' },
      { name: 'Servicios', type: 'expense' as const, color: '#8b5cf6' },
      { name: 'Sueldo', type: 'income' as const, color: '#3b82f6' },
      { name: 'Freelance', type: 'income' as const, color: '#10b981' },
    ];
    for (const cat of defaults) {
      await db.insert(categories).values({ userId, ...cat });
    }
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await ensureDefaults(session.user!.id!);

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
