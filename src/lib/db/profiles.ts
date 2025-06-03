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
};
