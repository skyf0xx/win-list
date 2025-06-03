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
};
