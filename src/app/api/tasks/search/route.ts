import { NextRequest, NextResponse } from 'next/server';
import { taskFilterSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { taskService } from '@/lib/db';
import { z } from 'zod';

const searchTasksSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    query: z.string().min(1, 'Search query is required'),
    filters: taskFilterSchema.omit({ search: true }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = searchTasksSchema.safeParse(body);
        if (!validation.success) {
            const details = validation.error.errors.reduce((acc, error) => {
                acc[error.path.join('.')] = error.message;
                return acc;
            }, {} as Record<string, string>);

            return NextResponse.json(
                createErrorResponse('Validation failed', details),
                { status: 400 }
            );
        }

        const { userId, query, filters } = validation.data;

        const processedFilters = filters
            ? {
                  ...filters,
                  dueDateFrom: filters.dueDateFrom
                      ? new Date(filters.dueDateFrom)
                      : undefined,
                  dueDateTo: filters.dueDateTo
                      ? new Date(filters.dueDateTo)
                      : undefined,
              }
            : undefined;

        const results = await taskService.searchTasks(
            userId,
            query,
            processedFilters
        );

        const response = {
            results,
            query,
            total: results.length,
        };

        return NextResponse.json(createSuccessResponse(response));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error searching tasks:', error);
        return NextResponse.json(
            createErrorResponse('Failed to search tasks'),
            { status: 500 }
        );
    }
}
