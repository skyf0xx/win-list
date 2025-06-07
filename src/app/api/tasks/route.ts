import { NextRequest, NextResponse } from 'next/server';
import {
    createTaskSchema,
    paginationSchema,
    taskFilterSchema,
    taskSortSchema,
} from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { taskService } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const profileId = searchParams.get('profileId');

        if (!profileId) {
            return NextResponse.json(
                createErrorResponse('profileId is required'),
                { status: 400 }
            );
        }

        const filters = {
            ...(searchParams.get('status') && {
                status: searchParams.get('status'),
            }),
            ...(searchParams.get('categoryId') && {
                categoryId: searchParams.get('categoryId'),
            }),
            ...(searchParams.get('priority') && {
                priority: searchParams.get('priority'),
            }),
            ...(searchParams.get('search') && {
                search: searchParams.get('search'),
            }),
            ...(searchParams.get('dueDateFrom') && {
                dueDateFrom: searchParams.get('dueDateFrom'),
            }),
            ...(searchParams.get('dueDateTo') && {
                dueDateTo: searchParams.get('dueDateTo'),
            }),
        };

        const filterValidation = taskFilterSchema.safeParse(filters);
        if (!filterValidation.success) {
            const details = filterValidation.error.errors.reduce(
                (acc, error) => {
                    acc[error.path.join('.')] = error.message;
                    return acc;
                },
                {} as Record<string, string>
            );

            return NextResponse.json(
                createErrorResponse('Invalid filters', details),
                { status: 400 }
            );
        }

        const sortValidation = taskSortSchema.safeParse({
            field: searchParams.get('sortBy') || 'sortOrder',
            direction: searchParams.get('sortDirection') || 'asc',
        });
        if (!sortValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid sort options'),
                { status: 400 }
            );
        }

        const paginationParams: Record<string, string | null> = {};
        const limitParam = searchParams.get('limit');
        const offsetParam = searchParams.get('offset');

        if (limitParam !== null) {
            paginationParams.limit = limitParam;
        }
        if (offsetParam !== null) {
            paginationParams.offset = offsetParam;
        }

        const paginationValidation =
            paginationSchema.safeParse(paginationParams);
        if (!paginationValidation.success) {
            const details = paginationValidation.error.errors.reduce(
                (acc, error) => {
                    acc[error.path.join('.')] = error.message;
                    return acc;
                },
                {} as Record<string, string>
            );

            return NextResponse.json(
                createErrorResponse('Invalid pagination parameters', details),
                { status: 400 }
            );
        }

        const processedFilters = {
            ...filterValidation.data,
            dueDateFrom: filterValidation.data.dueDateFrom
                ? new Date(filterValidation.data.dueDateFrom)
                : undefined,
            dueDateTo: filterValidation.data.dueDateTo
                ? new Date(filterValidation.data.dueDateTo)
                : undefined,
        };

        const tasks = await taskService.getByProfileId(
            profileId,
            processedFilters,
            sortValidation.data,
            paginationValidation.data.limit,
            paginationValidation.data.offset
        );

        return NextResponse.json(createSuccessResponse(tasks));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching tasks:', error);
        return NextResponse.json(createErrorResponse('Failed to fetch tasks'), {
            status: 500,
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = createTaskSchema.safeParse(body);
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

        const taskData = {
            profile: { connect: { id: validation.data.profileId } },
            title: validation.data.title,
            description: validation.data.description,
            status: validation.data.status,
            priority: validation.data.priority,
            ...(validation.data.dueDate && {
                dueDate: new Date(validation.data.dueDate),
            }),
            ...(validation.data.categoryId && {
                category: { connect: { id: validation.data.categoryId } },
            }),
        };

        const task = await taskService.create(taskData);
        return NextResponse.json(
            createSuccessResponse(task, 'Task created successfully'),
            { status: 201 }
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error creating task:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to create task: ${message}`),
            { status: 500 }
        );
    }
}
