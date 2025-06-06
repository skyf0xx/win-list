import { NextRequest, NextResponse } from 'next/server';
import { updateTaskSchema, idParamSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { taskService } from '@/lib/db';
import type { Prisma } from '@/generated/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idValidation = idParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid task ID format'),
                { status: 400 }
            );
        }

        const task = await taskService.getById(id);
        if (!task) {
            return NextResponse.json(createErrorResponse('Task not found'), {
                status: 404,
            });
        }

        return NextResponse.json(createSuccessResponse(task));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching task:', error);
        return NextResponse.json(createErrorResponse('Failed to fetch task'), {
            status: 500,
        });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idValidation = idParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid task ID format'),
                { status: 400 }
            );
        }

        const body = await request.json();
        const validation = updateTaskSchema.safeParse(body);
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

        const updateData: Prisma.TaskUpdateInput = {
            ...(validation.data.title && { title: validation.data.title }),
            ...(validation.data.description !== undefined && {
                description: validation.data.description,
            }),
            ...(validation.data.status && { status: validation.data.status }),
            ...(validation.data.priority && {
                priority: validation.data.priority,
            }),
            ...(validation.data.dueDate && {
                dueDate: new Date(validation.data.dueDate),
            }),
        };

        if (validation.data.categoryId !== undefined) {
            if (validation.data.categoryId === null) {
                updateData.category = { disconnect: true };
            } else {
                updateData.category = {
                    connect: { id: validation.data.categoryId },
                };
            }
        }

        const task = await taskService.update(id, updateData);
        return NextResponse.json(
            createSuccessResponse(task, 'Task updated successfully')
        );
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error updating task:', error);
        return NextResponse.json(createErrorResponse('Failed to update task'), {
            status: 500,
        });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idValidation = idParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid task ID format'),
                { status: 400 }
            );
        }

        await taskService.delete(id);
        return NextResponse.json(
            createSuccessResponse(id, 'Task deleted successfully')
        );
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error deleting task:', error);
        return NextResponse.json(createErrorResponse('Failed to delete task'), {
            status: 500,
        });
    }
}
