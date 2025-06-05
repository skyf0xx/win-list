'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Task } from '@/generated/prisma';
import { AppHeader } from '@/components/layout/app-header';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSkeleton } from '@/components/base/loading-skeleton';
import { EmptyState } from '@/components/base/empty-state';
import { ErrorMessage } from '@/components/base/error-message';
import { useCurrentProfile, useTasksByStatus } from '@/hooks/api';
import { useCategories } from '@/hooks/api';
import { TaskModal } from '@/components/features/tasks/task-modal';
import { TaskStatusSection } from '@/components/features/tasks/task-status-section';
import { ProfileCreationModal } from '@/components/features/profiles/profile-creation-modal';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Get current profile with fallback to first profile
    const {
        currentProfile,
        profiles,
        isLoading: profilesLoading,
        hasProfiles,
    } = useCurrentProfile(session?.user?.id || '', currentProfileId);

    // Get tasks grouped by status with search filter
    const {
        tasks,
        counts,
        isLoading: tasksLoading,
        error: tasksError,
    } = useTasksByStatus(currentProfile?.id || '', {
        search: searchQuery || undefined,
    });

    // Get categories for the current profile
    const { data: categories = [] } = useCategories(currentProfile?.id || '');

    // Auto-select profile when profiles load
    useEffect(() => {
        if (profiles.length && !currentProfileId) {
            setCurrentProfileId(profiles[0].id);
        }
    }, [profiles, currentProfileId]);

    // Handle profile creation success
    const handleProfileCreated = (newProfileId: string) => {
        setCurrentProfileId(newProfileId);
        setShowProfileModal(false);
    };

    // Handle opening task modal for new task
    const handleNewTask = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };

    // Handle opening task modal for editing
    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    // Handle closing task modal
    const handleCloseModal = () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    // Handle successful task creation/update
    const handleTaskSuccess = (task: Task) => {
        // TanStack Query will automatically update the cache
        // so we don't need to manually update state here
        console.log('Task saved successfully:', task);
    };

    // Handle create profile button click
    const handleCreateProfile = () => {
        setShowProfileModal(true);
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

    // Not authenticated
    if (status === 'unauthenticated' || !session) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <EmptyState
                    type="general"
                    title="Please sign in"
                    description="You need to be signed in to access your tasks."
                />
            </div>
        );
    }

    // No profiles - show create first profile
    if (!profilesLoading && !hasProfiles) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-6 max-w-md mx-auto px-4">
                        <EmptyState
                            type="profiles"
                            title="Welcome to Task Manager!"
                            description="Let's get started by creating your first profile to organize your tasks."
                            action={{
                                label: 'Create Your First Profile',
                                onClick: handleCreateProfile,
                            }}
                        />
                    </div>
                </div>

                {/* Profile Creation Modal */}
                <ProfileCreationModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    userId={session.user.id}
                    onSuccess={handleProfileCreated}
                />
            </div>
        );
    }

    // Tasks loading error
    if (tasksError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader
                    profiles={profiles}
                    currentProfileId={currentProfileId}
                    onProfileChange={setCurrentProfileId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onNewTask={handleNewTask}
                    onCreateProfile={handleCreateProfile}
                    loading={profilesLoading}
                />
                <MainLayout>
                    <ErrorMessage
                        message="Failed to load tasks"
                        retry={{
                            onClick: () => window.location.reload(),
                            loading: false,
                        }}
                    />
                </MainLayout>
            </div>
        );
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
                onCreateProfile={handleCreateProfile}
            />

            <MainLayout loading={tasksLoading}>
                {/* Search Results Indicator */}
                {searchQuery && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Showing results for:{' '}
                            <strong>&quot;{searchQuery}&quot;</strong>
                            {counts.total > 0 && (
                                <span className="ml-2">
                                    ({counts.total} task
                                    {counts.total !== 1 ? 's' : ''})
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {/* No Search Results */}
                {searchQuery && counts.total === 0 && !tasksLoading && (
                    <EmptyState
                        type="search"
                        title="No tasks found"
                        description={`No tasks match "${searchQuery}". Try a different search term.`}
                    />
                )}

                {/* Task Sections */}
                {(!searchQuery || counts.total > 0) && (
                    <div className="space-y-6">
                        {/* Pending Tasks */}
                        <TaskStatusSection
                            status="PENDING"
                            tasks={tasks.pending}
                            categories={categories}
                            count={counts.pending}
                            onTaskClick={handleEditTask}
                        />

                        {/* In Progress Tasks */}
                        <TaskStatusSection
                            status="IN_PROGRESS"
                            tasks={tasks.inProgress}
                            categories={categories}
                            count={counts.inProgress}
                            onTaskClick={handleEditTask}
                        />

                        {/* Completed Tasks */}
                        <TaskStatusSection
                            status="COMPLETED"
                            tasks={tasks.completed}
                            categories={categories}
                            count={counts.completed}
                            onTaskClick={handleEditTask}
                        />
                    </div>
                )}
            </MainLayout>

            {/* Task Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                task={editingTask}
                categories={categories}
                profileId={currentProfile?.id || null}
                onClose={handleCloseModal}
                onSuccess={handleTaskSuccess}
            />

            {/* Profile Creation Modal */}
            <ProfileCreationModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                userId={session.user.id}
                onSuccess={handleProfileCreated}
            />
        </div>
    );
}
