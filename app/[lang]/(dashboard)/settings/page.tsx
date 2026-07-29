import { getUserSettings } from '@/features/user/settingsActions';
import { SettingsForm } from '@/features/user/components/SettingsForm';
import { redirect } from 'next/navigation';
import { auth } from '@/features/auth/auth';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const settings = await getUserSettings();

  if (!settings) {
    return <p className="text-red-500">Error al cargar configuración</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <SettingsForm
          settings={{
            closingDay: settings.closingDay,
            theme: settings.theme,
            language: settings.language,
            pushNotificationsEnabled: settings.pushNotificationsEnabled,
            budgetAlerts: settings.budgetAlerts,
            installmentReminders: settings.installmentReminders,
            goalReminders: settings.goalReminders,
          }}
        />
      </div>
    </div>
  );
}
