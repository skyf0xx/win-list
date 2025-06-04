import { NextRequest, NextResponse } from 'next/server';
import { updateProfileSchema, idParamSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { profileService, taskService } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idValidation = idParamSchema.safeParse({ id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid profile ID format'),
                { status: 400 }
            );
        }

        const profile = await profileService.getById(id);
        if (!profile) {
            return NextResponse.json(createErrorResponse('Profile not found'), {
                status: 404,
            });
        }

        const taskStats = await taskService.getTaskStats(id);
        const profileWithStats = { ...profile, taskStats };

        return NextResponse.json(createSuccessResponse(profileWithStats));
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            createErrorResponse('Failed to fetch profile'),
            { status: 500 }
        );
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
                createErrorResponse('Invalid profile ID format'),
                { status: 400 }
            );
        }

        const body = await request.json();
        const validation = updateProfileSchema.safeParse(body);
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

        const existingProfile = await profileService.getById(id);
        if (!existingProfile) {
            return NextResponse.json(createErrorResponse('Profile not found'), {
                status: 404,
            });
        }

        if (validation.data.name) {
            const isUnique = await profileService.isNameUnique(
                existingProfile.userId,
                validation.data.name,
                id
            );
            if (!isUnique) {
                return NextResponse.json(
                    createErrorResponse('Profile name already exists', {
                        name: 'A profile with this name already exists for this user',
                    }),
                    { status: 409 }
                );
            }
        }

        const profile = await profileService.update(id, validation.data);
        return NextResponse.json(
            createSuccessResponse(profile, 'Profile updated successfully')
        );
    } catch (error) {
        console.error('Error updating profile:', error);

        const message =
            error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            createErrorResponse(`Failed to update profile ${message}`),
            { status: 500 }
        );
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
                createErrorResponse('Invalid profile ID format'),
                { status: 400 }
            );
        }

        const profile = await profileService.delete(id);
        return NextResponse.json(
            createSuccessResponse(profile, 'Profile deleted successfully')
        );
    } catch (error) {
        console.error('Error deleting profile:', error);
        return NextResponse.json(
            createErrorResponse('Failed to delete profile'),
            { status: 500 }
        );
    }
}
