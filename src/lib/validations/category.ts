import { z } from 'zod';

export const createCategorySchema = z.object({
    profileId: z.string().uuid('Invalid profile ID'),
    name: z.string().min(1, 'Category name is required').max(50),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
        .optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50).optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
        .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
