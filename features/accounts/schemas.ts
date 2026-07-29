import { z } from 'zod';

export const accountTypeEnum = z.enum(['checking', 'savings', 'cash', 'credit_card']);

export const createAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: accountTypeEnum,
  color: z.string().min(1, 'Selecciona un color'),
  icon: z.string().optional(),
});

export type CreateAccountInput = z.input<typeof createAccountSchema>;
