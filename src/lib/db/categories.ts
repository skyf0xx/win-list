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

    // Get category by ID
    async getById(id: string): Promise<Category | null> {
        return prisma.category.findUnique({
            where: { id },
            include: {
                profile: true,
                tasks: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
            },
        });
    },

    // Get all categories for a profile
    async getByProfileId(profileId: string): Promise<Category[]> {
        return prisma.category.findMany({
            where: { profileId },
            include: {
                tasks: {
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    },
};
