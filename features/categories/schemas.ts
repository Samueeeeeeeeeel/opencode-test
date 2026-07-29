import { z } from 'zod';

export const categoryTypeEnum = z.enum(['income', 'expense']);

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: categoryTypeEnum,
  color: z.string().min(1, 'Selecciona un color'),
  icon: z.string().optional(),
});

export type CreateCategoryInput = z.input<typeof createCategorySchema>;
