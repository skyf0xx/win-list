import { prisma } from '../prisma';
import type { User, Prisma } from '../../generated/prisma';

export const userService = {
    // Create a new user
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
            include: {
                profiles: true,
            },
        });
    },
};
