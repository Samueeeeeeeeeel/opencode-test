import { z } from 'zod';

export const createDebtSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  totalAmount: z.coerce.number().positive('El monto debe ser positivo'),
  interestRate: z.coerce.number().optional(),
  startDate: z.string().min(1, 'Selecciona una fecha'),
  dueDate: z.string().optional(),
  personName: z.string().optional(),
});

export const payDebtSchema = z.object({
  debtId: z.string().min(1),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.string().min(1),
  note: z.string().optional(),
});

export type CreateDebtInput = z.input<typeof createDebtSchema>;
export type PayDebtInput = z.input<typeof payDebtSchema>;
