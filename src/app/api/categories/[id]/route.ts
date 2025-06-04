import { NextRequest, NextResponse } from 'next/server';
import { updateCategorySchema, idParamSchema } from '@/lib/validations';
import {
    createSuccessResponse,
    createErrorResponse,
} from '@/lib/validations/api';
import { categoryService } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const idValidation = idParamSchema.safeParse({ id: params.id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid category ID format'),
                { status: 400 }
            );
        }

        const category = await categoryService.getById(params.id);
        if (!category) {
            return NextResponse.json(
                createErrorResponse('Category not found'),
                { status: 404 }
            );
        }

        const categoryWithCount = {
            ...category,
            taskCount: category.tasks.length,
        };

        return NextResponse.json(createSuccessResponse(categoryWithCount));
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error fetching category:', error);
        return NextResponse.json(
            createErrorResponse('Failed to fetch category'),
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const idValidation = idParamSchema.safeParse({ id: params.id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid category ID format'),
                { status: 400 }
            );
        }

        const body = await request.json();
        const validation = updateCategorySchema.safeParse(body);
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

        const category = await categoryService.update(
            params.id,
            validation.data
        );
        return NextResponse.json(
            createSuccessResponse(category, 'Category updated successfully')
        );
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error updating category:', error);
        return NextResponse.json(
            createErrorResponse('Failed to update category'),
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const idValidation = idParamSchema.safeParse({ id: params.id });
        if (!idValidation.success) {
            return NextResponse.json(
                createErrorResponse('Invalid category ID format'),
                { status: 400 }
            );
        }

        const category = await categoryService.delete(params.id);
        return NextResponse.json(
            createSuccessResponse(category, 'Category deleted successfully')
        );
    } catch (error) {
        if (process.env.NODE_ENV !== 'test')
            console.error('Error deleting category:', error);
        return NextResponse.json(
            createErrorResponse('Failed to delete category'),
            { status: 500 }
        );
    }
}
