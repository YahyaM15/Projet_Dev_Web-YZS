import { z } from 'zod';

export const createCounterSchema = z.object({
  type: z.enum(['WATER', 'ELECTRICITY']),
  counterNumber: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1).max(255),
});

export const updateCounterSchema = z.object({
  type: z.enum(['WATER', 'ELECTRICITY']).optional(),
  counterNumber: z.string().trim().min(1).max(50).optional(),
  address: z.string().trim().min(1).max(255).optional(),
});

export const recordIndexSchema = z.object({
  counterId: z.string().uuid(),
  value: z.number().positive(),
  timestamp: z.string().datetime().optional(),
});

export const counterIdSchema = z.object({
  counterId: z.string().uuid(),
});
