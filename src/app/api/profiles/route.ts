import { NextRequest, NextResponse } from 'next/server';
import { createProfileSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { profileService } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                createErrorResponse('userId is required'),
                { status: 400 }
            );
        }

        const profiles = await profileService.getByUserId(userId);

        return NextResponse.json(createSuccessResponse(profiles));
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching profiles:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to fetch profiles ${message}`),
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = createProfileSchema.safeParse(body);
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

        const { userId, name } = validation.data;

        const isUnique = await profileService.isNameUnique(userId, name);
        if (!isUnique) {
            return NextResponse.json(
                createErrorResponse('Profile name already exists', {
                    name: 'A profile with this name already exists for this user',
                }),
                { status: 409 } // Conflict
            );
        }

        const profile = await profileService.create({
            user: { connect: { id: validation.data.userId } },
            name: validation.data.name,
            color: validation.data.color,
        });

        return NextResponse.json(
            createSuccessResponse(profile, 'Profile created successfully'),
            { status: 201 }
        );
    } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error creating profile:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to create profiles: ${message}`),
            { status: 500 }
        );
    }
}
