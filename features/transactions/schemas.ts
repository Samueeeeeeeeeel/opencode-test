import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'Selecciona una fecha'),
  status: z.enum(['confirmed', 'pending']).default('confirmed'),
  note: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const createInstallmentSchema = z.object({
  type: z.enum(['expense']),
  totalAmount: z.coerce.number().positive('El monto debe ser positivo'),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  numberOfInstallments: z.coerce.number().int().min(2).max(48),
  startDate: z.string().min(1, 'Selecciona una fecha'),
  note: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateInstallmentInput = z.input<typeof createInstallmentSchema>;
