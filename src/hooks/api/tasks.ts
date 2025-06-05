import { Task } from '@/generated/prisma';
import { taskApi } from '@/lib/api';
import { TaskFilterInput, UpdateTaskInput } from '@/lib/validations';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

export const useTasks = (profileId: string, filters?: TaskFilterInput) => {
    return useQuery({
        queryKey: queryKeys.tasks.byProfileId(profileId, filters),
        queryFn: () => taskApi.getByProfileId(profileId, filters),
        enabled: !!profileId,
    });
};

export const useTask = (id: string) => {
    return useQuery({
        queryKey: queryKeys.tasks.byId(id),
        queryFn: () => taskApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: taskApi.create,
        onSuccess: (newTask) => {
            // Invalidate all task queries for this profile
            queryClient.invalidateQueries({
                queryKey: ['tasks', 'profile', newTask.profileId],
                refetchType: 'all', // Forces refetch of both active AND inactive queries
            });

            // Also invalidate the specific profile to update task counts
            queryClient.invalidateQueries({
                queryKey: ['profiles', newTask.profileId],
                refetchType: 'all',
            });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
            taskApi.update(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTasks = queryClient.getQueriesData({
                queryKey: ['tasks'],
            });

            // Optimistically update all task caches
            queryClient.setQueriesData<Task[]>(
                { queryKey: ['tasks'] },
                (old) => {
                    // Type guard: ensure old is an array
                    if (!Array.isArray(old)) return old;

                    return old.map((task) =>
                        task.id === id ? ({ ...task, ...data } as Task) : task
                    );
                }
            );

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSuccess: (updatedTask) => {
            // Update individual task cache
            queryClient.setQueryData(
                queryKeys.tasks.byId(updatedTask.id),
                updatedTask
            );

            // Invalidate all task lists for this profile with refetchType: 'all'
            queryClient.invalidateQueries({
                queryKey: ['tasks', 'profile', updatedTask.profileId],
                refetchType: 'all',
            });

            // Also invalidate profile if task status changed (for counts)
            queryClient.invalidateQueries({
                queryKey: ['profiles', updatedTask.profileId],
                refetchType: 'all',
            });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: taskApi.delete,
        onMutate: async (taskId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTasks = queryClient.getQueriesData({
                queryKey: ['tasks'],
            });

            // Optimistically remove from all task caches
            queryClient.setQueriesData<Task[]>(
                { queryKey: ['tasks'] },
                (old) => {
                    // Type guard: ensure old is an array
                    if (!Array.isArray(old)) return old;

                    return old.filter((task) => task.id !== taskId);
                }
            );

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSuccess: (deletedTask) => {
            // Remove individual task cache
            queryClient.removeQueries({
                queryKey: queryKeys.tasks.byId(deletedTask.id),
            });

            // Invalidate task lists to ensure consistency
            queryClient.invalidateQueries({
                queryKey: ['tasks', 'profile', deletedTask.profileId],
                refetchType: 'all',
            });

            // Also invalidate profile for updated task counts
            queryClient.invalidateQueries({
                queryKey: ['profiles', deletedTask.profileId],
                refetchType: 'all',
            });
        },
    });
};

export const useTaskSearch = (
    userId: string,
    query: string,
    filters?: {
        status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
        categoryId?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH';
        dueDateFrom?: string;
        dueDateTo?: string;
    }
) => {
    return useQuery({
        queryKey: queryKeys.tasks.search(userId, query, filters),
        queryFn: () => taskApi.search({ userId, query, filters }),
        enabled: !!userId && !!query.trim(),
    });
};

export const useBulkUpdateTaskOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: taskApi.bulkUpdateOrder,
        onMutate: async ({ taskUpdates }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot previous values
            const previousTasks = queryClient.getQueriesData({
                queryKey: ['tasks'],
            });

            // Create a map of updates for quick lookup
            const updateMap = new Map(
                taskUpdates.map((update) => [update.id, update.sortOrder])
            );

            // Optimistically update sort orders in all task caches
            queryClient.setQueriesData<Task[]>(
                { queryKey: ['tasks'] },
                (old) => {
                    // Type guard: ensure old is an array
                    if (!Array.isArray(old)) return old;

                    return old.map((task) => {
                        const newSortOrder = updateMap.get(task.id);
                        return newSortOrder !== undefined
                            ? { ...task, sortOrder: newSortOrder }
                            : task;
                    });
                }
            );

            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                context.previousTasks.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after bulk update to ensure consistency
            queryClient.invalidateQueries({
                queryKey: ['tasks'],
                refetchType: 'all',
            });
        },
    });
};
