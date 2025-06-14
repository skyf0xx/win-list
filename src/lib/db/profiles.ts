import { prisma } from '../prisma';
import type { Profile, Prisma } from '../../generated/prisma';

export const profileService = {
    // Check if profile name is unique for a user
    async isNameUnique(
        userId: string,
        name: string,
        excludeId?: string
    ): Promise<boolean> {
        const existingProfile = await prisma.profile.findFirst({
            where: {
                userId,
                name: {
                    equals: name.trim(),
                    mode: 'insensitive', // Case-insensitive comparison
                },
                ...(excludeId && { id: { not: excludeId } }),
            },
        });

        return !existingProfile;
    },
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

    // Get profile by user ID and name
    async getByUserIdAndName(
        userId: string,
        name: string
    ): Promise<Profile | null> {
        return prisma.profile.findFirst({
            where: {
                userId,
                name: {
                    equals: name.trim(),
                    mode: 'insensitive',
                },
            },
            include: {
                user: true,
                tasks: true,
                categories: true,
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

    // Delete profile
    async delete(id: string): Promise<Profile> {
        return prisma.profile.delete({
            where: { id },
        });
    },

    // Get profile count for a user
    async getCountByUserId(userId: string): Promise<number> {
        return prisma.profile.count({
            where: { userId },
        });
    },
};
