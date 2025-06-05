'use client';

import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function LoginButton() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Sign in error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="rounded-full border border-muted bg-muted/50 px-6 py-3 text-sm font-medium">
                Loading...
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <span className="text-sm text-muted-foreground">
                    Welcome, {session.user?.name || session.user?.email}!
                </span>
                <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={handleSignIn} disabled={isLoading} className="gap-2">
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
    );
}
