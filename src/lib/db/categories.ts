import { prisma } from '../prisma';
import type { Category, Prisma, Profile, Task } from '../../generated/prisma';

type CategoryWithRelations = Category & {
    tasks: Task[];
    profile: Profile;
};

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
    async getById(id: string): Promise<CategoryWithRelations | null> {
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

    // Get all categories
    async getAll(): Promise<Category[]> {
        return prisma.category.findMany({
            include: {
                profile: true,
                tasks: true,
            },
        });
    },

    // Update category
    async update(
        id: string,
        data: Prisma.CategoryUpdateInput
    ): Promise<Category> {
        return prisma.category.update({
            where: { id },
            data,
            include: {
                profile: true,
                tasks: true,
            },
        });
    },

    // Delete category
    async delete(id: string): Promise<Category> {
        return prisma.category.delete({
            where: { id },
        });
    },
};
