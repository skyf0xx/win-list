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
};
