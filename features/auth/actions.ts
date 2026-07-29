'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { signIn } from './auth';
import { registerSchema, loginSchema } from './schemas';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export async function registerUser(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (existing) {
    return { error: { email: ['Este email ya está registrado'] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
  });

  await signIn('credentials', { email, password, redirect: false });

  return { success: true };
}

export async function loginUser(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: { form: ['Credenciales inválidas'] } };
    }
    return { error: { form: ['Error al iniciar sesión'] } };
  }
}
