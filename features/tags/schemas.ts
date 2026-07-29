import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export type CreateTagInput = z.input<typeof createTagSchema>;
