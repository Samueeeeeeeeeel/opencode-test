import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2099),
});

export type CreateBudgetInput = z.input<typeof createBudgetSchema>;
