import { z } from 'zod';

export const TaskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
    profileId: z.string().uuid('Invalid profile ID'),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().optional(),
    status: TaskStatusEnum.default('PENDING'),
    dueDate: z
        .string()
        .date()
        .transform((dateStr) => {
            return `${dateStr}T00:00:00.000Z`;
        })
        .optional(),
    priority: PriorityEnum.default('MEDIUM'),
});

export const updateTaskSchema = z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    title: z.string().min(1, 'Task title is required').max(200).optional(),
    description: z.string().optional(),
    status: TaskStatusEnum.optional(),
    dueDate: z
        .string()
        .date()
        .transform((dateStr) => {
            return `${dateStr}T00:00:00.000Z`;
        })
        .optional(),
    priority: PriorityEnum.optional(),
});

export const updateTaskStatusSchema = z.object({
    status: TaskStatusEnum,
});

export const taskFilterSchema = z.object({
    status: TaskStatusEnum.optional(),
    categoryId: z.string().uuid().optional(),
    priority: PriorityEnum.optional(),
    search: z.string().optional(),
    dueDateFrom: z
        .string()
        .date()
        .transform((dateStr) => {
            return `${dateStr}T00:00:00.000Z`;
        })
        .optional(),
    dueDateTo: z
        .string()
        .date()
        .transform((dateStr) => {
            return `${dateStr}T00:00:00.000Z`;
        })
        .optional(),
});

export const taskSortSchema = z.object({
    field: z
        .enum([
            'title',
            'dueDate',
            'priority',
            'status',
            'createdAt',
            'sortOrder',
        ])
        .default('sortOrder'),
    direction: z.enum(['asc', 'desc']).default('asc'),
});

export const bulkUpdateTaskOrderSchema = z.object({
    taskUpdates: z.array(
        z.object({
            id: z.string().uuid('Invalid task ID'),
            sortOrder: z.number().int().min(0),
        })
    ),
});

export const paginationSchema = z
    .object({
        limit: z.coerce.number().positive().optional(),
        offset: z.coerce.number().min(0).optional(),
    })
    .transform((data) => ({
        limit: data.limit || undefined,
        offset: data.offset || undefined,
    }));

export const searchTasksSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    query: z.string().min(1, 'Search query is required'),
    filters: taskFilterSchema.omit({ search: true }).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type TaskSortInput = z.infer<typeof taskSortSchema>;
export type BulkUpdateTaskOrderInput = z.infer<
    typeof bulkUpdateTaskOrderSchema
>;
export type PaginationInput = z.infer<typeof paginationSchema>;
