import { z } from 'zod';

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'Selecciona cuenta origen'),
  toAccountId: z.string().min(1, 'Selecciona cuenta destino'),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.string().min(1, 'Selecciona una fecha'),
  note: z.string().optional(),
});

export type CreateTransferInput = z.input<typeof createTransferSchema>;
