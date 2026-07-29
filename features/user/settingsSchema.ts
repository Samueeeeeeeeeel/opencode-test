import { z } from 'zod';

export const updateSettingsSchema = z.object({
  closingDay: z.coerce.number().int().min(1).max(28),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['es', 'en']),
});

export type UpdateSettingsInput = z.input<typeof updateSettingsSchema>;
