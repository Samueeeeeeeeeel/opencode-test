import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/features/user/components/OnboardingWizard';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const settings = await db.query.userSettings.findFirst({
    where: (us, { eq }) => eq(us.userId, session.user!.id!),
  });

  if (settings?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          Bienvenido a Aford
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Configuremos tu espacio financiero en unos pasos
        </p>
      </div>

      <OnboardingWizard />
    </div>
  );
}
