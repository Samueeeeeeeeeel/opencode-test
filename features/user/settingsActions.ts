'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateSettingsSchema } from './settingsSchema';
import { revalidatePath } from 'next/cache';

function boolFromForm(value: FormDataEntryValue | null): boolean {
  return value === 'on';
}

export async function getUserSettings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const settings = await db.query.userSettings.findFirst({
    where: (us, { eq }) => eq(us.userId, session.user!.id!),
  });

  if (!settings) {
    const [created] = await db
      .insert(userSettings)
      .values({ userId: session.user!.id! })
      .returning();
    return created;
  }

  return settings;
}

export async function updateSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = updateSettingsSchema.safeParse({
    closingDay: formData.get('closingDay'),
    theme: formData.get('theme'),
    language: formData.get('language'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { closingDay, theme, language } = parsed.data;

  await db
    .insert(userSettings)
    .values({
      userId: session.user!.id!,
      closingDay,
      theme,
      language,
      pushNotificationsEnabled: boolFromForm(formData.get('pushNotificationsEnabled')),
      budgetAlerts: boolFromForm(formData.get('budgetAlerts')),
      installmentReminders: boolFromForm(formData.get('installmentReminders')),
      goalReminders: boolFromForm(formData.get('goalReminders')),
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        closingDay,
        theme,
        language,
        pushNotificationsEnabled: boolFromForm(formData.get('pushNotificationsEnabled')),
        budgetAlerts: boolFromForm(formData.get('budgetAlerts')),
        installmentReminders: boolFromForm(formData.get('installmentReminders')),
        goalReminders: boolFromForm(formData.get('goalReminders')),
        updatedAt: new Date(),
      },
    });

  revalidatePath('/[lang]/settings');
  return { success: true };
}
