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
};
