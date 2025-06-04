import { NextRequest, NextResponse } from 'next/server';
import { createCategorySchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { categoryService } from '@/lib/db';

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

        const categories = await categoryService.getByProfileId(profileId);

        return NextResponse.json(createSuccessResponse(categories));
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            createErrorResponse('Failed to fetch categories'),
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = createCategorySchema.safeParse(body);
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

        const category = await categoryService.create({
            profile: { connect: { id: validation.data.profileId } },
            name: validation.data.name,
            color: validation.data.color,
        });

        return NextResponse.json(
            createSuccessResponse(category, 'Category created successfully'),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            createErrorResponse('Failed to create category'),
            { status: 500 }
        );
    }
}
