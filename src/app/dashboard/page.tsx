'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { ProfileCreateForm } from '@/components/features/profiles/profile-create-form';
// TODO: Import these when you create the hooks
// import { useProfiles, useCreateProfile } from '@/hooks/profiles';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileForm, setShowProfileForm] = useState(false);

    // TODO: Uncomment when hooks are created
    // const { data: profiles = [], isLoading: profilesLoading } = useProfiles(session?.user?.id);
    // const createProfileMutation = useCreateProfile();

    // Temporary mock data for now
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles: any[] = [];
    const profilesLoading = false;
    const createProfileMutation = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutateAsync: async (data: any) => {
            console.log('Creating profile:', data);
            // TODO: Replace with actual mutation
        },
        isPending: false,
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        redirect('/');
    }

    // TODO: Set default profile when profiles load
    // useEffect(() => {
    //     if (profiles.length && !currentProfileId) {
    //         setCurrentProfileId(profiles[0].id);
    //     }
    // }, [profiles, currentProfileId]);

    const handleCreateProfile = async (data: {
        name: string;
        color?: string;
    }) => {
        try {
            await createProfileMutation.mutateAsync({
                userId: session.user.id,
                ...data,
            });
            setShowProfileForm(false);
            // TODO: Set the new profile as current when hooks are connected
        } catch (error) {
            console.error('Failed to create profile:', error);
            // TODO: Add toast notification for error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader
                profiles={profiles}
                currentProfileId={currentProfileId}
                onProfileChange={setCurrentProfileId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewTask={() => {
                    // TODO: Open task creation modal
                    console.log('Open new task modal');
                }}
                onCreateProfile={() => setShowProfileForm(true)}
                loading={profilesLoading}
            />

            <main className="container mx-auto px-4 py-6">
                {/* TODO: Add main content - task sections */}
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        Main content will go here - task sections, etc.
                    </p>
                </div>
            </main>

            {/* Profile Creation Modal */}
            {showProfileForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <ProfileCreateForm
                        onSubmit={handleCreateProfile}
                        onCancel={() => setShowProfileForm(false)}
                        loading={createProfileMutation.isPending}
                    />
                </div>
            )}
        </div>
    );
}
