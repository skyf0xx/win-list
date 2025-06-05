'use client';

import { Profile } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Plus, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { LoadingSkeleton } from '@/components/base/loading-skeleton';
import { cn } from '@/lib/utils';

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

    const currentProfile = profiles.find((p) => p.id === currentProfileId);

    const handleClearSearch = useCallback(() => {
        onSearchChange('');
    }, [onSearchChange]);

    const handleProfileSelect = useCallback(
        (value: string) => {
            if (value === 'create-new') {
                onCreateProfile?.();
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

    if (loading) {
        return (
            <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <LoadingSkeleton variant="profile" />
                        <LoadingSkeleton
                            variant="text"
                            className="flex-1 max-w-md"
                        />
                        <LoadingSkeleton
                            variant="circle"
                            className="w-24 h-10"
                        />
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
                <div className="flex items-center gap-4">
                    {/* Profile Selector */}
                    <div className="flex-shrink-0">
                        <Select
                            value={currentProfileId || ''}
                            onValueChange={handleProfileSelect}
                        >
                            <SelectTrigger className="w-[180px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select profile">
                                    {currentProfile ? (
                                        <div className="flex items-center gap-2">
                                            {currentProfile.color && (
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            currentProfile.color,
                                                    }}
                                                />
                                            )}
                                            <span className="truncate">
                                                {currentProfile.name}
                                            </span>
                                        </div>
                                    ) : (
                                        'Select profile'
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {profiles.map((profile) => (
                                    <SelectItem
                                        key={profile.id}
                                        value={profile.id}
                                    >
                                        <div className="flex items-center gap-2">
                                            {profile.color && (
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            profile.color,
                                                    }}
                                                />
                                            )}
                                            <span className="truncate">
                                                {profile.name}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                                {onCreateProfile && (
                                    <>
                                        <div className="h-px bg-gray-200 my-1" />
                                        <SelectItem
                                            value="create-new"
                                            className="text-blue-600 focus:text-blue-600"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Plus className="w-3 h-3" />
                                                <span>Create New Profile</span>
                                            </div>
                                        </SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md">
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
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* New Task Button */}
                    <div className="flex-shrink-0">
                        <Button
                            onClick={onNewTask}
                            disabled={!currentProfileId}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 gap-2"
                            title="Create new task (⌘N)"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Search Results Indicator */}
                <div className="md:hidden">
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
