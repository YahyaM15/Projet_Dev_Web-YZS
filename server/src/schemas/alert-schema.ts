import { z } from 'zod';

export const configureAlertThresholdSchema = z.object({
  counterId: z.uuid(),
  threshold: z.number().finite().nonnegative(),
  alertType: z.enum(['EAU', 'ELECTRICITE']),
});

export const alertIdSchema = z.object({
  alertId: z.uuid(),
});

export type ConfigureAlertThresholdInput = z.infer<
  typeof configureAlertThresholdSchema
>;
