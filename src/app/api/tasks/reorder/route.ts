import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateTaskOrderSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { taskService } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = bulkUpdateTaskOrderSchema.safeParse(body);
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

        const { taskUpdates } = validation.data;

        // Verify all tasks belong to the same profile for security
        const tasks = await Promise.all(
            taskUpdates.map(({ id }) => taskService.getById(id))
        );

        const missingTasks = tasks.filter((task) => !task);
        if (missingTasks.length > 0) {
            return NextResponse.json(
                createErrorResponse('One or more tasks not found'),
                { status: 404 }
            );
        }

        const profileIds = [...new Set(tasks.map((task) => task!.profileId))];
        if (profileIds.length > 1) {
            return NextResponse.json(
                createErrorResponse(
                    'All tasks must belong to the same profile'
                ),
                { status: 400 }
            );
        }

        console.log('taskUpdates', taskUpdates);
        await taskService.updateTaskOrder(taskUpdates);

        return NextResponse.json(
            createSuccessResponse(
                {
                    updated: taskUpdates.length,
                    failed: 0,
                },
                'Task order updated successfully'
            )
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error updating task order:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Error updating task order: ${message}`),
            { status: 500 }
        );
    }
}
