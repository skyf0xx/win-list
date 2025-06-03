import { prisma } from '../prisma';
import type { Category, Prisma } from '../../generated/prisma';

export const categoryService = {
    // Create a new category
    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return prisma.category.create({
            data,
            include: {
                profile: true,
                tasks: true,
            },
        });
    },
};
