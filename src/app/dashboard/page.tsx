'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { ProfileCreateForm } from '@/components/features/profiles/profile-create-form';
import { useCreateProfile, useProfiles } from '@/hooks/api';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileForm, setShowProfileForm] = useState(false);

    const { data: profiles = [], isLoading: profilesLoading } = useProfiles(
        session?.user?.id || ''
    );
    const createProfileMutation = useCreateProfile();

    // Set default profile when profiles load
    useEffect(() => {
        if (
            session &&
            status === 'authenticated' &&
            profiles.length &&
            !currentProfileId
        ) {
            setCurrentProfileId(profiles[0].id);
        }
    }, [profiles, currentProfileId, session, status]);

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

    const handleCreateProfile = async (data: {
        name: string;
        color?: string;
    }) => {
        if (!session?.user?.id) return;

        try {
            const newProfile = await createProfileMutation.mutateAsync({
                userId: session.user.id,
                ...data,
            });

            setCurrentProfileId(newProfile.id);
            setShowProfileForm(false);

            // TODO: Add success toast notification
            console.log('Profile created successfully:', newProfile.name);
        } catch (error) {
            console.error('Failed to create profile:', error);
            // TODO: Add error toast notification
        }
    };

    const handleNewTask = () => {
        if (!currentProfileId) {
            // Show message that they need a profile first
            console.log('Please create a profile first');
            setShowProfileForm(true);
            return;
        }
        // TODO: Open task creation modal
        console.log('Open new task modal for profile:', currentProfileId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader
                profiles={profiles}
                currentProfileId={currentProfileId}
                onProfileChange={setCurrentProfileId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewTask={handleNewTask}
                onCreateProfile={() => setShowProfileForm(true)}
                loading={profilesLoading}
            />

            <main className="container mx-auto px-4 py-6">
                {/* Show create profile prompt if no profiles exist */}
                {!profilesLoading &&
                    profiles.length === 0 &&
                    !showProfileForm && (
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Welcome to Win List
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Get started by creating your first profile
                                    to organize your tasks.
                                </p>
                                <button
                                    onClick={() => setShowProfileForm(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                                >
                                    Create Your First Profile
                                </button>
                            </div>
                        </div>
                    )}

                {/* Main content when profiles exist */}
                {profiles.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            Main content will go here - task sections, etc.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Current profile:{' '}
                            {profiles.find((p) => p.id === currentProfileId)
                                ?.name || 'None'}
                        </p>
                    </div>
                )}
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
