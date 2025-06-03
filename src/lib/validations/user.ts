import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email('Invalid email address').max(255),
    name: z.string().min(1, 'Name is required').max(100),
});

export const updateUserSchema = z.object({
    email: z.string().email('Invalid email address').max(255).optional(),
    name: z.string().min(1, 'Name is required').max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
