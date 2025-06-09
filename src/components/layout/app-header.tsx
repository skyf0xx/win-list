'use client';

import { Profile } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { Search, Plus, X, LogOut, User } from 'lucide-react';
import { useState, useCallback } from 'react';
import { LoadingSkeleton } from '@/components/base/loading-skeleton';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

interface AppHeaderProps {
    profiles: Profile[];
    currentProfileId: string | null;
    onProfileChange: (profileId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewTask: () => void;
    onCreateProfile?: () => void;
    loading?: boolean;
}

export function AppHeader({
    profiles,
    currentProfileId,
    onProfileChange,
    searchQuery,
    onSearchChange,
    onNewTask,
    onCreateProfile,
    loading = false,
}: AppHeaderProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { data: session } = useSession();

    const currentProfile = profiles.find((p) => p.id === currentProfileId);

    const handleClearSearch = useCallback(() => {
        onSearchChange('');
    }, [onSearchChange]);

    const handleProfileSelect = useCallback(
        async (value: string) => {
            if (value === 'create-new' && onCreateProfile) {
                onCreateProfile();
            } else if (value === 'sign-out') {
                setIsSigningOut(true);
                try {
                    await signOut({ callbackUrl: '/' });
                } catch (error) {
                    console.error('Sign out error:', error);
                    setIsSigningOut(false);
                }
            } else {
                onProfileChange(value);
            }
        },
        [onCreateProfile, onProfileChange]
    );

    // Keyboard shortcuts
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'k') {
                    e.preventDefault();
                    const searchInput = document.querySelector(
                        '[data-search-input]'
                    ) as HTMLInputElement;
                    searchInput?.focus();
                } else if (e.key === 'n') {
                    e.preventDefault();
                    onNewTask();
                }
            }
        },
        [onNewTask]
    );

    // Generate user initials for avatar
    const getUserInitials = () => {
        if (!session?.user?.name) return 'U';
        const names = session.user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    if (loading) {
        return (
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <LoadingSkeleton variant="text" className="w-32" />
                        <LoadingSkeleton
                            variant="text"
                            className="flex-1 max-w-md mx-4"
                        />
                        <div className="flex items-center gap-3">
                            <LoadingSkeleton
                                variant="circle"
                                className="w-24 h-10"
                            />
                            <LoadingSkeleton
                                variant="circle"
                                className="w-10 h-10 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header
            className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
            onKeyDown={handleKeyDown}
        >
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* App Logo/Brand (Left Side) */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Win List
                        </h1>
                    </div>

                    {/* Search Bar (Center) */}
                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                data-search-input
                                type="text"
                                placeholder="Search tasks... (⌘K)"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className={cn(
                                    'pl-9 pr-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                                    (isSearchFocused || searchQuery) &&
                                        'ring-2 ring-blue-500/20'
                                )}
                                disabled={isSigningOut}
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                    disabled={isSigningOut}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* New Task Button */}
                        <Button
                            onClick={onNewTask}
                            disabled={!currentProfileId || isSigningOut}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 gap-2"
                            title="Create new task (⌘N)"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </Button>

                        {/* Profile Selector */}
                        <Select
                            value={currentProfileId || ''}
                            onValueChange={handleProfileSelect}
                            disabled={isSigningOut}
                        >
                            <SelectTrigger className="w-auto border-none bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:ring-0 focus:ring-offset-0 p-2">
                                <div className="flex items-center gap-2">
                                    {/* User Avatar */}
                                    <div className="relative">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                            style={{
                                                backgroundColor:
                                                    currentProfile?.color ||
                                                    '#3B82F6', // Default to blue if no profile color
                                            }}
                                        >
                                            {getUserInitials()}
                                        </div>

                                        {/* Profile Color Indicator */}
                                        {currentProfile?.color && (
                                            <div
                                                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                                                style={{
                                                    backgroundColor:
                                                        currentProfile.color,
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Profile Name & Chevron */}
                                    <div className="hidden sm:flex items-center gap-1">
                                        <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                                            {currentProfile?.name ||
                                                'Select profile'}
                                        </span>
                                    </div>
                                </div>
                            </SelectTrigger>

                            <SelectContent align="end" className="w-56">
                                {/* User Info Header */}
                                {session?.user && (
                                    <>
                                        <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                <span className="truncate">
                                                    {session.user.name ||
                                                        session.user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Profiles Section */}
                                <div className="py-1">
                                    {profiles.map((profile) => (
                                        <SelectItem
                                            key={profile.id}
                                            value={profile.id}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            profile.color ||
                                                            '#6B7280',
                                                    }}
                                                />
                                                <span className="truncate flex-1">
                                                    {profile.name}
                                                </span>
                                                {profile.id ===
                                                    currentProfileId && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </div>

                                {/* Actions Section */}
                                <div className="border-t border-gray-100 pt-1">
                                    {/* Create New Profile Option */}
                                    {onCreateProfile && (
                                        <SelectItem
                                            value="create-new"
                                            className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Plus className="w-4 h-4" />
                                                <span>Create New Profile</span>
                                            </div>
                                        </SelectItem>
                                    )}

                                    {/* Sign Out Option */}
                                    <SelectItem
                                        value="sign-out"
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        disabled={isSigningOut}
                                    >
                                        <div className="flex items-center gap-2">
                                            <LogOut className="w-4 h-4" />
                                            <span>
                                                {isSigningOut
                                                    ? 'Signing out...'
                                                    : 'Sign Out'}
                                            </span>
                                        </div>
                                    </SelectItem>
                                </div>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mobile Search Results Indicator */}
                <div className="sm:hidden">
                    {searchQuery && (
                        <div className="mt-3 px-1">
                            <div className="text-sm text-gray-600">
                                Searching for:{' '}
                                <span className="font-medium">
                                    &quot;{searchQuery}&quot;
                                </span>
                                <button
                                    onClick={handleClearSearch}
                                    className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                                    disabled={isSigningOut}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
