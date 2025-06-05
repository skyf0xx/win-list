import { useProfiles } from './profiles';
import { TaskFilterInput } from '@/lib/validations';
import { useTasks } from './tasks';

//get the current profile with automatic fallback to first profile
export const useCurrentProfile = (
    userId: string,
    currentProfileId: string | null
) => {
    const { data: profiles, isLoading } = useProfiles(userId);

    const currentProfile =
        profiles?.find((p) => p.id === currentProfileId) ||
        profiles?.[0] ||
        null;

    return {
        currentProfile,
        profiles: profiles || [],
        isLoading,
        hasProfiles: (profiles?.length || 0) > 0,
    };
};

//get tasks grouped by status for the current profile
export const useTasksByStatus = (
    profileId: string,
    filters?: TaskFilterInput
) => {
    const { data: tasks, isLoading, error } = useTasks(profileId, filters);

    const groupedTasks = {
        pending: tasks?.filter((task) => task.status === 'PENDING') || [],
        inProgress:
            tasks?.filter((task) => task.status === 'IN_PROGRESS') || [],
        completed: tasks?.filter((task) => task.status === 'COMPLETED') || [],
    };

    const counts = {
        pending: groupedTasks.pending.length,
        inProgress: groupedTasks.inProgress.length,
        completed: groupedTasks.completed.length,
        total: tasks?.length || 0,
    };

    return {
        tasks: groupedTasks,
        counts,
        allTasks: tasks || [],
        isLoading,
        error,
    };
};
