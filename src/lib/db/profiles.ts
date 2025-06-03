import { prisma } from '../prisma';
import type { Profile, Prisma } from '../../generated/prisma';

export const profileService = {
    // Create a new profile
    async create(data: Prisma.ProfileCreateInput): Promise<Profile> {
        return prisma.profile.create({
            data,
            include: {
                user: true,
                tasks: true,
                categories: true,
            },
        });
    },

    // Get profile by ID
    async getById(id: string): Promise<Profile | null> {
        return prisma.profile.findUnique({
            where: { id },
            include: {
                user: true,
                tasks: {
                    include: {
                        category: true,
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                categories: true,
            },
        });
    },

    // Get all profiles for a user
    async getByUserId(userId: string): Promise<Profile[]> {
        return prisma.profile.findMany({
            where: { userId },
            include: {
                tasks: {
                    include: {
                        category: true,
                    },
                },
                categories: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    },

    // Get all profiles
    async getAll(): Promise<Profile[]> {
        return prisma.profile.findMany({
            include: {
                user: true,
                tasks: true,
                categories: true,
            },
        });
    },

    // Update profile
    async update(
        id: string,
        data: Prisma.ProfileUpdateInput
    ): Promise<Profile> {
        return prisma.profile.update({
            where: { id },
            data,
            include: {
                user: true,
                tasks: true,
                categories: true,
            },
        });
    },
};
