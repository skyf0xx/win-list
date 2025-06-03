import { z } from 'zod';

export const createProfileSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    name: z.string().min(1, 'Profile name is required').max(50),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
        .optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Profile name is required').max(50).optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
        .optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
