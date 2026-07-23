import { z } from 'zod';

export const configureAlertThresholdSchema = z.object({
  counterId: z.uuid(),
  threshold: z.number().finite().nonnegative(),
  alertType: z.enum(['EAU', 'ELECTRICITE']),
});

export const alertIdSchema = z.object({
  alertId: z.uuid(),
});

export const alertFilterSchema = z.object({
  resolved: z.enum(['true', 'false']).optional(),
  type: z.enum(['EAU', 'ELECTRICITE']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export type ConfigureAlertThresholdInput = z.infer<
  typeof configureAlertThresholdSchema
>;
