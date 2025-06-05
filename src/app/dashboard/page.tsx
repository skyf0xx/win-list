'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';

export default function Dashboard() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader
                profiles={[]} // TODO: Connect to useProfiles hook
                currentProfileId={null}
                onProfileChange={() => {}}
                searchQuery=""
                onSearchChange={() => {}}
                onNewTask={() => {}}
                loading={false}
            />
            <main>{/* TODO: Add main content */}</main>
        </div>
    );
}
