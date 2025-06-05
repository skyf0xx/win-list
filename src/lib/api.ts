import { Category, Profile, Task, User } from '@/generated/prisma';
import {
    ApiResponse,
    CreateTaskInput,
    TaskFilterInput,
    UpdateTaskInput,
} from './validations';
const API_BASE = '/api';

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const result: ApiResponse<T> = await response.json();

        if (!result.success || !response.ok) {
            if (!result.success) {
                throw new Error(result.error || 'Request failed');
            }
            throw new Error('Request failed');
        }

        return result.data as T;
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

export const userApi = {
    getAll: (): Promise<User[]> => apiRequest('/users'),

    getById: (id: string): Promise<User> => apiRequest(`/users/${id}`),

    create: (data: { email: string; name: string }): Promise<User> =>
        apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (
        id: string,
        data: { email?: string; name?: string }
    ): Promise<User> =>
        apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<User> =>
        apiRequest(`/users/${id}`, {
            method: 'DELETE',
        }),
};

export const profileApi = {
    getByUserId: (userId: string): Promise<Profile[]> =>
        apiRequest(`/profiles?userId=${userId}`),

    getById: (id: string): Promise<Profile> => apiRequest(`/profiles/${id}`),

    create: (data: {
        userId: string;
        name: string;
        color?: string;
    }): Promise<Profile> =>
        apiRequest('/profiles', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (
        id: string,
        data: { name?: string; color?: string }
    ): Promise<Profile> =>
        apiRequest(`/profiles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<Profile> =>
        apiRequest(`/profiles/${id}`, {
            method: 'DELETE',
        }),
};

export const categoryApi = {
    getByProfileId: (profileId: string): Promise<Category[]> =>
        apiRequest(`/categories?profileId=${profileId}`),

    getById: (id: string): Promise<Category> => apiRequest(`/categories/${id}`),

    create: (data: {
        profileId: string;
        name: string;
        color?: string;
    }): Promise<Category> =>
        apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (
        id: string,
        data: { name?: string; color?: string }
    ): Promise<Category> =>
        apiRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<Category> =>
        apiRequest(`/categories/${id}`, {
            method: 'DELETE',
        }),
};

export const taskApi = {
    getByProfileId: (
        profileId: string,
        filters?: TaskFilterInput
    ): Promise<Task[]> => {
        const params = new URLSearchParams({ profileId });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }

        return apiRequest(`/tasks?${params.toString()}`);
    },

    getById: (id: string): Promise<Task> => apiRequest(`/tasks/${id}`),

    create: (data: CreateTaskInput): Promise<Task> =>
        apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateTaskInput): Promise<Task> =>
        apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<Task> =>
        apiRequest(`/tasks/${id}`, {
            method: 'DELETE',
        }),

    search: (data: {
        userId: string;
        query: string;
        filters?: {
            status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
            categoryId?: string;
            priority?: 'LOW' | 'MEDIUM' | 'HIGH';
            dueDateFrom?: string;
            dueDateTo?: string;
        };
    }): Promise<{
        results: Task[];
        query: string;
        total: number;
    }> =>
        apiRequest('/tasks/search', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    bulkUpdateOrder: (data: {
        taskUpdates: Array<{
            id: string;
            sortOrder: number;
        }>;
    }): Promise<{
        updated: number;
        failed: number;
    }> =>
        apiRequest('/tasks/bulk-update-order', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export const formatDateForApi = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const parseDateFromApi = (dateString: string): Date => {
    return new Date(dateString);
};
