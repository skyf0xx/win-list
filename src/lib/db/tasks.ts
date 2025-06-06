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
                    {
                        category: {
                            name: {
                                contains: filters.search,
                                mode: 'insensitive',
                            },
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

    // Get all tasks for a category
    async getByCategoryId(categoryId: string): Promise<Task[]> {
        return prisma.task.findMany({
            where: { categoryId },
            include: {
                profile: true,
                category: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    },

    // Search tasks across all profiles for a user
    async searchTasks(
        userId: string,
        searchTerm: string,
        filters?: Omit<TaskFilters, 'search'>
    ): Promise<Task[]> {
        return prisma.task.findMany({
            where: {
                profile: { userId },
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    {
                        description: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        },
                    },
                    {
                        category: {
                            name: { contains: searchTerm, mode: 'insensitive' },
                        },
                    },
                ],
                ...(filters?.status && { status: filters.status }),
                ...(filters?.categoryId && { categoryId: filters.categoryId }),
                ...(filters?.priority && { priority: filters.priority }),
            },
            include: {
                profile: true,
                category: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    },

    // Get tasks by status
    async getByStatus(profileId: string, status: TaskStatus): Promise<Task[]> {
        return prisma.task.findMany({
            where: { profileId, status },
            include: {
                profile: true,
                category: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    },

    // Get overdue tasks
    async getOverdueTasks(profileId: string): Promise<Task[]> {
        return prisma.task.findMany({
            where: {
                profileId,
                dueDate: { lt: new Date() },
                status: { not: 'COMPLETED' },
            },
            include: {
                profile: true,
                category: true,
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    },

    // Get tasks due today
    async getTasksDueToday(profileId: string): Promise<Task[]> {
        const today = new Date();
        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        );

        return prisma.task.findMany({
            where: {
                profileId,
                dueDate: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                profile: true,
                category: true,
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    },

    // Update task
    async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data,
            include: {
                profile: true,
                category: true,
            },
        });
    },

    // Update task status
    async updateStatus(id: string, status: TaskStatus): Promise<Task> {
        return prisma.task.update({
            where: { id },
            data: { status },
            include: {
                profile: true,
                category: true,
            },
        });
    },

    // Bulk update task order (for drag and drop)
    async updateTaskOrder(
        taskUpdates: { id: string; sortOrder: number }[]
    ): Promise<void> {
        await prisma.$transaction(
            taskUpdates.map(({ id, sortOrder }) =>
                prisma.task.update({
                    where: { id },
                    data: { sortOrder },
                })
            )
        );
    },

    // Delete task
    async delete(id: string): Promise<Task> {
        return prisma.task.delete({
            where: { id },
        });
    },

    // Get task statistics for a profile
    async getTaskStats(profileId: string) {
        const stats = await prisma.task.groupBy({
            by: ['status'],
            where: { profileId },
            _count: { status: true },
        });

        const overdue = await prisma.task.count({
            where: {
                profileId,
                dueDate: { lt: new Date() },
                status: { not: 'COMPLETED' },
            },
        });

        return {
            total: stats.reduce((sum, stat) => sum + stat._count.status, 0),
            pending:
                stats.find((s) => s.status === 'PENDING')?._count.status || 0,
            inProgress:
                stats.find((s) => s.status === 'IN_PROGRESS')?._count.status ||
                0,
            completed:
                stats.find((s) => s.status === 'COMPLETED')?._count.status || 0,
            overdue,
        };
    },
};
