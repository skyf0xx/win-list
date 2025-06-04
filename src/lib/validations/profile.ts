import { z } from 'zod';

export const createProfileSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    name: z
        .string()
        .min(1, 'Profile name is required')
        .max(50, 'Profile name must be 50 characters or less')
        .trim(), // Add trim to prevent whitespace-only names
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
        .optional(),
});

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Profile name is required')
        .max(50, 'Profile name must be 50 characters or less')
        .trim()
        .optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
        .optional(),
});

export const validateUniqueProfileName = z.object({
    userId: z.string().uuid(),
    name: z.string().min(1).max(50).trim(),
    excludeId: z.string().uuid().optional(), // For updates, exclude current profile
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ValidateUniqueProfileNameInput = z.infer<
    typeof validateUniqueProfileName
>;
