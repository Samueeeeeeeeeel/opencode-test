import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  targetAmount: z.coerce.number().positive('El monto debe ser positivo'),
  targetDate: z.string().optional(),
  accountId: z.string().optional(),
  color: z.string().optional(),
});

export const addFundsSchema = z.object({
  goalId: z.string().min(1),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.string().min(1),
  note: z.string().optional(),
});

export type CreateGoalInput = z.input<typeof createGoalSchema>;
export type AddFundsInput = z.input<typeof addFundsSchema>;
