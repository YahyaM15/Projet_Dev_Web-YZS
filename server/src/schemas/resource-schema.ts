import { z } from 'zod';

export const createCounterSchema = z.object({
  type: z.enum(['EAU', 'ELECTRICITE']),
  counterNumber: z.string().trim().min(1).max(100),
  address: z.string().trim().min(2).max(255),
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
export type RecordIndexInput = z.infer<typeof recordIndexSchema>;
