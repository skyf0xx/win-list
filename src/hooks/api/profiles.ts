'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { UpdateProfileInput } from '@/lib/validations';
import { Profile } from '@/generated/prisma';
import { queryKeys } from './query-keys';

export const useProfiles = (userId: string) => {
    return useQuery({
        queryKey: queryKeys.profiles.byUserId(userId),
        queryFn: () => profileApi.getByUserId(userId),
        enabled: !!userId,
    });
};

export const useProfile = (id: string) => {
    return useQuery({
        queryKey: queryKeys.profiles.byId(id),
        queryFn: () => profileApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: profileApi.create,
        onSuccess: (newProfile) => {
            // Add to profiles list cache
            queryClient.setQueryData<Profile[]>(
                queryKeys.profiles.byUserId(newProfile.userId),
                (old) => (old ? [...old, newProfile] : [newProfile])
            );
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProfileInput }) =>
            profileApi.update(id, data),
        onSuccess: (updatedProfile) => {
            // Update individual profile cache
            queryClient.setQueryData(
                queryKeys.profiles.byId(updatedProfile.id),
                updatedProfile
            );

            // Update profile in profiles list
            queryClient.setQueryData<Profile[]>(
                queryKeys.profiles.byUserId(updatedProfile.userId),
                (old) =>
                    old?.map((profile) =>
                        profile.id === updatedProfile.id
                            ? updatedProfile
                            : profile
                    )
            );
        },
    });
};

export const useDeleteProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: profileApi.delete,
        onSuccess: (deletedProfile) => {
            // Remove from profiles list
            queryClient.setQueryData<Profile[]>(
                queryKeys.profiles.byUserId(deletedProfile.userId),
                (old) =>
                    old?.filter((profile) => profile.id !== deletedProfile.id)
            );

            // Remove individual profile cache
            queryClient.removeQueries({
                queryKey: queryKeys.profiles.byId(deletedProfile.id),
            });

            // Remove all related tasks and categories
            queryClient.removeQueries({
                queryKey: queryKeys.tasks.byProfileId(deletedProfile.id),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.categories.byProfileId(deletedProfile.id),
            });
        },
    });
};
