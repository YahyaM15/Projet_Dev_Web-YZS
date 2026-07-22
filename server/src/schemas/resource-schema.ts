import { z } from 'zod';

export const createCounterSchema = z.object({
  type: z.enum(['EAU', 'ELECTRICITE']),
  counterNumber: z.string().trim().min(1).max(100),
  address: z.string().trim().min(2).max(255),
});

export const updateCounterSchema = z.object({
  type: z.enum(['EAU', 'ELECTRICITE']).optional(),
  counterNumber: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(2).max(255).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one counter property must be provided.',
});

export const counterIdSchema = z.object({
  counterId: z.uuid(),
});

export const recordIndexSchema = z.object({
  counterId: z.uuid(),
  value: z.number().finite().min(0),
  timestamp: z.coerce.date(),
});

export type CreateCounterInput = z.infer<typeof createCounterSchema>;
export type UpdateCounterInput = z.infer<typeof updateCounterSchema>;
export type RecordIndexInput = z.infer<typeof recordIndexSchema>;
