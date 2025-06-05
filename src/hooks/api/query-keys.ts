import { TaskFilterInput } from '@/lib/validations';

export const queryKeys = {
    users: {
        all: ['users'] as const,
        byId: (id: string) => ['users', id] as const,
    },
    profiles: {
        all: ['profiles'] as const,
        byUserId: (userId: string) => ['profiles', 'user', userId] as const,
        byId: (id: string) => ['profiles', id] as const,
    },
    categories: {
        all: ['categories'] as const,
        byProfileId: (profileId: string) =>
            ['categories', 'profile', profileId] as const,
        byId: (id: string) => ['categories', id] as const,
    },
    tasks: {
        all: ['tasks'] as const,
        byProfileId: (profileId: string, filters?: TaskFilterInput) =>
            ['tasks', 'profile', profileId, filters] as const,
        byId: (id: string) => ['tasks', id] as const,
        search: (
            userId: string,
            query: string,
            filters?: {
                status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
                categoryId?: string;
                priority?: 'LOW' | 'MEDIUM' | 'HIGH';
                dueDateFrom?: string;
                dueDateTo?: string;
            }
        ) => ['tasks', 'search', userId, query, filters] as const,
    },
};
