import { userApi } from '@/lib/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { User } from '@/generated/prisma';

export const useUsers = () => {
    return useQuery({
        queryKey: queryKeys.users.all,
        queryFn: userApi.getAll,
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: queryKeys.users.byId(id),
        queryFn: () => userApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.create,
        onSuccess: (newUser) => {
            // Add to users list cache
            queryClient.setQueryData<User[]>(queryKeys.users.all, (old) =>
                old ? [...old, newUser] : [newUser]
            );
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: { email?: string; name?: string };
        }) => userApi.update(id, data),
        onSuccess: (updatedUser) => {
            // Update user in cache
            queryClient.setQueryData(
                queryKeys.users.byId(updatedUser.id),
                updatedUser
            );

            // Update user in users list
            queryClient.setQueryData<User[]>(queryKeys.users.all, (old) =>
                old?.map((user) =>
                    user.id === updatedUser.id ? updatedUser : user
                )
            );
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.delete,
        onSuccess: (deletedUser) => {
            // Remove from users list
            queryClient.setQueryData<User[]>(queryKeys.users.all, (old) =>
                old?.filter((user) => user.id !== deletedUser.id)
            );

            // Remove individual user cache
            queryClient.removeQueries({
                queryKey: queryKeys.users.byId(deletedUser.id),
            });
        },
    });
};
