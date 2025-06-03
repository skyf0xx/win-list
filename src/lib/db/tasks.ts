import { prisma } from '../prisma';
import type {
    Task,
    Prisma,
    TaskStatus,
    Priority,
} from '../../generated/prisma';

interface TaskFilters {
    status?: TaskStatus;
    categoryId?: string;
    priority?: Priority;
    search?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
}

interface TaskSortOptions {
    field:
        | 'title'
        | 'dueDate'
        | 'priority'
        | 'status'
        | 'createdAt'
        | 'sortOrder';
    direction: 'asc' | 'desc';
}

export const taskService = {
    async create(data: Prisma.TaskCreateInput): Promise<Task> {
        // Get the highest sort order for this profile and increment
        const maxSortOrder = await prisma.task.aggregate({
            where: { profileId: data.profile.connect?.id },
            _max: { sortOrder: true },
        });

        const sortOrder = (maxSortOrder._max.sortOrder || 0) + 1;

        return prisma.task.create({
            data: {
                ...data,
                sortOrder,
            },
            include: {
                profile: true,
                category: true,
            },
        });
    },

    // Get task by ID
    async getById(id: string): Promise<Task | null> {
        return prisma.task.findUnique({
            where: { id },
            include: {
                profile: true,
                category: true,
            },
        });
    },

    // Get all tasks for a profile with optional filters
    async getByProfileId(
        profileId: string,
        filters?: TaskFilters,
        sort?: TaskSortOptions,
        limit?: number,
        offset?: number
    ): Promise<Task[]> {
        const where: Prisma.TaskWhereInput = {
            profileId,
            ...(filters?.status && { status: filters.status }),
            ...(filters?.categoryId && { categoryId: filters.categoryId }),
            ...(filters?.priority && { priority: filters.priority }),
            ...(filters?.search && {
                OR: [
                    {
                        title: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: filters.search,
                            mode: 'insensitive',
                        },
                    },
                ],
            }),
            ...(filters?.dueDateFrom && {
                dueDate: { gte: filters.dueDateFrom },
            }),
            ...(filters?.dueDateTo && {
                dueDate: { lte: filters.dueDateTo },
            }),
            ...(filters?.dueDateFrom &&
                filters?.dueDateTo && {
                    dueDate: {
                        gte: filters.dueDateFrom,
                        lte: filters.dueDateTo,
                    },
                }),
        };

        const orderBy = sort
            ? { [sort.field]: sort.direction }
            : { sortOrder: 'asc' as const };

        return prisma.task.findMany({
            where,
            include: {
                profile: true,
                category: true,
            },
            orderBy,
            ...(limit && { take: limit }),
            ...(offset && { skip: offset }),
        });
    },
};
