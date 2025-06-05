'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { MainLayout } from '@/components/layout/main-layout';
import { TaskStatusSection } from '@/components/features/tasks/task-status-section';
import { ProfileCreateForm } from '@/components/features/profiles/profile-create-form';
import { LoadingSkeleton } from '@/components/base/loading-skeleton';
import { EmptyState } from '@/components/base/empty-state';
import {
    useCreateProfile,
    useCurrentProfile,
    useTasksByStatus,
    useCategories,
} from '@/hooks/api';
import { Task } from '@/generated/prisma';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileForm, setShowProfileForm] = useState(false);

    const createProfileMutation = useCreateProfile();

    // Get current profile with automatic fallback
    const {
        currentProfile,
        profiles,
        isLoading: profilesLoading,
        hasProfiles,
    } = useCurrentProfile(session?.user?.id || '', currentProfileId);

    // Get tasks grouped by status with search filtering
    const {
        tasks,
        counts,
        isLoading: tasksLoading,
        error: tasksError,
    } = useTasksByStatus(
        currentProfile?.id || '',
        searchQuery ? { search: searchQuery } : undefined
    );

    // Get categories for the current profile
    const { data: categories = [] } = useCategories(currentProfile?.id || '');

    // Set default profile when profiles load
    useEffect(() => {
        if (hasProfiles && !currentProfileId && profiles.length > 0) {
            setCurrentProfileId(profiles[0].id);
        }
    }, [hasProfiles, currentProfileId, profiles]);

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
        if (!currentProfile) {
            console.log('Please create a profile first');
            setShowProfileForm(true);
            return;
        }
        // TODO: Open task creation modal
        console.log('Open new task modal for profile:', currentProfile.id);
    };

    const handleTaskClick = (task: Task) => {
        // TODO: Open task edit modal
        console.log('Edit task:', task.id, task.title);
    };

    // Loading state
    if (status === 'loading' || profilesLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <LoadingSkeleton variant="header" />
                <MainLayout>
                    <div className="space-y-6">
                        <LoadingSkeleton variant="task" count={3} />
                    </div>
                </MainLayout>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!session) {
        redirect('/');
    }

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

            <MainLayout loading={tasksLoading}>
                {/* No profiles state */}
                {!profilesLoading && !hasProfiles && !showProfileForm && (
                    <EmptyState
                        type="profiles"
                        title="Welcome to Win List"
                        description="Get started by creating your first profile to organize your tasks."
                        action={{
                            label: 'Create Your First Profile',
                            onClick: () => setShowProfileForm(true),
                        }}
                    />
                )}

                {/* Main content when profiles exist */}
                {hasProfiles && currentProfile && (
                    <div className="space-y-6">
                        {/* Search Results Header */}
                        {searchQuery && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Search Results
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            Found {counts.total} result
                                            {counts.total !== 1 ? 's' : ''} for
                                            &quot;{searchQuery}&quot;
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Task Sections */}
                        {tasksError ? (
                            <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-600 font-medium mb-2">
                                    Failed to load tasks
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    There was an error loading your tasks.
                                    Please try again.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : searchQuery && counts.total === 0 ? (
                            <EmptyState
                                type="search"
                                title="No tasks found"
                                description={`No tasks match "${searchQuery}". Try a different search term.`}
                            />
                        ) : (
                            <>
                                <TaskStatusSection
                                    status="PENDING"
                                    tasks={tasks.pending}
                                    categories={categories}
                                    count={counts.pending}
                                    onTaskClick={handleTaskClick}
                                />

                                <TaskStatusSection
                                    status="IN_PROGRESS"
                                    tasks={tasks.inProgress}
                                    categories={categories}
                                    count={counts.inProgress}
                                    onTaskClick={handleTaskClick}
                                />

                                <TaskStatusSection
                                    status="COMPLETED"
                                    tasks={tasks.completed}
                                    categories={categories}
                                    count={counts.completed}
                                    onTaskClick={handleTaskClick}
                                />
                            </>
                        )}

                        {/* No tasks message when no search and no tasks */}
                        {!searchQuery && counts.total === 0 && (
                            <EmptyState
                                type="tasks"
                                title="No tasks yet"
                                description="Create your first task to get started organizing your work."
                                action={{
                                    label: 'Create Task',
                                    onClick: handleNewTask,
                                }}
                            />
                        )}
                    </div>
                )}
            </MainLayout>

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
