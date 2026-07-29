'use server';

import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { updateProfileSchema, changePasswordSchema } from './schemas';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = updateProfileSchema.safeParse({
    name: formData.get('name'),
    image: formData.get('image') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      image: parsed.data.image || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, session.user!.id!),
  });

  if (!user?.passwordHash) return { error: 'Usuario no encontrado' };

  const isValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );

  if (!isValid) return { error: 'Contraseña actual incorrecta' };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
