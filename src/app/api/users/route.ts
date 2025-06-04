import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { userService } from '@/lib/db';

export async function GET() {
    try {
        const users = await userService.getAll();
        return NextResponse.json(createSuccessResponse(users));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching users:', error);
        return NextResponse.json(createErrorResponse('Failed to fetch users'), {
            status: 500,
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = createUserSchema.safeParse(body);
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

        const user = await userService.create(validation.data);
        return NextResponse.json(
            createSuccessResponse(user, 'User created successfully'),
            { status: 201 }
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error creating user:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to create user: ${message}`),
            { status: 500 }
        );
    }
}
