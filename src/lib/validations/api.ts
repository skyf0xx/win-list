import { Category, Profile, Task, User } from '@/generated/prisma';
import { z } from 'zod';

// Common API response schemas
export const successResponseSchema = z.object({
    success: z.literal(true),
    data: z.any(),
    message: z.string().optional(),
});

export const errorResponseSchema = z.object({
    success: z.literal(false),
    error: z.string(),
    details: z.record(z.string()).optional(),
});

export const apiResponseSchema = z.union([
    successResponseSchema,
    errorResponseSchema,
]);

// ID parameter validation
export const idParamSchema = z.object({
    id: z.string().uuid('Invalid ID format'),
});

export type SuccessResponse<T = unknown> = {
    success: true;
    data: T;
    message?: string;
};

export type ErrorResponse = {
    success: false;
    error: string;
    details?: Record<string, string>;
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
export type IdParam = z.infer<typeof idParamSchema>;

// Entity-specific response types
export type UserResponse = SuccessResponse<User>;
export type UsersResponse = SuccessResponse<User[]>;

export type ProfileResponse = SuccessResponse<Profile>;
export type ProfilesResponse = SuccessResponse<Profile[]>;

export type CategoryResponse = SuccessResponse<Category>;
export type CategoriesResponse = SuccessResponse<Category[]>;

export type TaskResponse = SuccessResponse<Task>;
export type TasksResponse = SuccessResponse<Task[]>;

// Statistics response types
export type TaskStatsResponse = SuccessResponse<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
}>;

// Paginated response types
export type PaginatedResponse<T> = SuccessResponse<{
    items: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}>;

export type PaginatedTasksResponse = PaginatedResponse<Task>;
export type PaginatedUsersResponse = PaginatedResponse<User>;
export type PaginatedProfilesResponse = PaginatedResponse<Profile>;
export type PaginatedCategoriesResponse = PaginatedResponse<Category>;

// Bulk operation response types
export type BulkUpdateResponse = SuccessResponse<{
    updated: number;
    failed: number;
    errors?: string[];
}>;

// Search response types
export type SearchResponse<T> = SuccessResponse<{
    results: T[];
    query: string;
    total: number;
}>;

export type TaskSearchResponse = SearchResponse<Task>;

// Delete response types
export type DeleteResponse = SuccessResponse<{
    id: string;
    deleted: boolean;
}>;

// Empty response for operations that don't return data
export type EmptyResponse = SuccessResponse<null>;

// Health check response type
export type HealthResponse = SuccessResponse<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
        database: 'connected' | 'disconnected';
    };
}>;

// Authentication response types (if you implement auth later)
export type AuthResponse = SuccessResponse<{
    user: User;
    token?: string;
    expiresAt?: string;
}>;

// Validation error response type
export type ValidationErrorResponse = ErrorResponse & {
    details: Record<string, string>;
};

// Type guards for runtime type checking
export function isSuccessResponse<T>(
    response: ApiResponse<T>
): response is SuccessResponse<T> {
    return response.success === true;
}

export function isErrorResponse(
    response: ApiResponse
): response is ErrorResponse {
    return response.success === false;
}

// Helper function to create typed responses
export function createSuccessResponse<T>(
    data: T,
    message?: string
): SuccessResponse<T> {
    return {
        success: true,
        data,
        ...(message && { message }),
    };
}

export function createErrorResponse(
    error: string,
    details?: Record<string, string>
): ErrorResponse {
    return {
        success: false,
        error,
        ...(details && { details }),
    };
}
