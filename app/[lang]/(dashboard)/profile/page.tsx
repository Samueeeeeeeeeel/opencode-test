import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/features/user/components/ProfileForm';
import { ChangePasswordForm } from '@/features/user/components/ChangePasswordForm';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user!.id!),
  });

  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
          }}
        />
      </div>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
