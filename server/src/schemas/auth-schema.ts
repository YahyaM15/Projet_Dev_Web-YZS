import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, '8 caractères minimum')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Doit contenir un caractère spécial'),
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(['ADMIN', 'MANAGER', 'RESIDENTIAL']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
