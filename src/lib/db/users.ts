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

    // Get user by ID
    async getById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                profiles: {
                    include: {
                        tasks: true,
                        categories: true,
                    },
                },
            },
        });
    },

    // Get user by email
    async getByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
            include: {
                profiles: true,
            },
        });
    },

    // Get all users
    async getAll(): Promise<User[]> {
        return prisma.user.findMany({
            include: {
                profiles: true,
            },
        });
    },

    // Update user
    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
            include: {
                profiles: true,
            },
        });
    },

    // Delete user
    async delete(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    },
};
