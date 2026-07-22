import { Role } from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(12)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/\d/)
    .regex(/[^A-Za-z0-9]/),
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(Role).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
