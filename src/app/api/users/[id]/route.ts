import { NextRequest, NextResponse } from 'next/server';
import { updateUserSchema, idParamSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { userService } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idValidation = idParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid user ID format'),
                { status: 400 }
            );
        }

        const user = await userService.getById(id);
        if (!user) {
            return NextResponse.json(createErrorResponse('User not found'), {
                status: 404,
            });
        }

        return NextResponse.json(createSuccessResponse(user));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching user:', error);
        return NextResponse.json(createErrorResponse('Failed to fetch user'), {
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
                createErrorResponse('Invalid user ID format'),
                { status: 400 }
            );
        }

        const body = await request.json();

        const validation = updateUserSchema.safeParse(body);
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

        const user = await userService.update(id, validation.data);
        return NextResponse.json(
            createSuccessResponse(user, 'User updated successfully')
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error updating user:', error);

        return NextResponse.json(createErrorResponse('Failed to update user'), {
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
                createErrorResponse('Invalid user ID format'),
                { status: 400 }
            );
        }

        const user = await userService.delete(id);
        return NextResponse.json(
            createSuccessResponse(user, 'User deleted successfully')
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error deleting user:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to delete user: ${message}`),
            { status: 500 }
        );
    }
}
