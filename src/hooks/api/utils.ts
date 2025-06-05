import { useProfiles } from './profiles';
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
