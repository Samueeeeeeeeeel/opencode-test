import { z } from 'zod';

export const createRecurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  accountId: z.string().min(1, 'Selecciona una cuenta'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']),
  startDate: z.string().min(1, 'Selecciona una fecha'),
  endDate: z.string().optional(),
  note: z.string().optional(),
});

export type CreateRecurringInput = z.input<typeof createRecurringSchema>;
