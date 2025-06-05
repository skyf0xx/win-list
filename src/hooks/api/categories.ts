import { Category } from '@/generated/prisma';
import { categoryApi } from '@/lib/api';
import { UpdateCategoryInput } from '@/lib/validations';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

export const useCategories = (profileId: string) => {
    return useQuery({
        queryKey: queryKeys.categories.byProfileId(profileId),
        queryFn: () => categoryApi.getByProfileId(profileId),
        enabled: !!profileId,
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: queryKeys.categories.byId(id),
        queryFn: () => categoryApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoryApi.create,
        onSuccess: (newCategory) => {
            // Add to categories list cache
            queryClient.setQueryData<Category[]>(
                queryKeys.categories.byProfileId(newCategory.profileId),
                (old) => (old ? [...old, newCategory] : [newCategory])
            );
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
            categoryApi.update(id, data),
        onSuccess: (updatedCategory) => {
            // Update individual category cache
            queryClient.setQueryData(
                queryKeys.categories.byId(updatedCategory.id),
                updatedCategory
            );

            // Update category in categories list
            queryClient.setQueryData<Category[]>(
                queryKeys.categories.byProfileId(updatedCategory.profileId),
                (old) =>
                    old?.map((category) =>
                        category.id === updatedCategory.id
                            ? updatedCategory
                            : category
                    )
            );

            // Invalidate tasks that might reference this category
            queryClient.invalidateQueries({
                queryKey: queryKeys.tasks.byProfileId(
                    updatedCategory.profileId
                ),
            });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoryApi.delete,
        onSuccess: (deletedCategory) => {
            // Remove from categories list
            queryClient.setQueryData<Category[]>(
                queryKeys.categories.byProfileId(deletedCategory.profileId),
                (old) =>
                    old?.filter(
                        (category) => category.id !== deletedCategory.id
                    )
            );

            // Remove individual category cache
            queryClient.removeQueries({
                queryKey: queryKeys.categories.byId(deletedCategory.id),
            });

            // Invalidate tasks since they may have lost their category reference
            queryClient.invalidateQueries({
                queryKey: queryKeys.tasks.byProfileId(
                    deletedCategory.profileId
                ),
            });
        },
    });
};
