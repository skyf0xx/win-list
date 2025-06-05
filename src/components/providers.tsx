'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {

    return (
        <SessionProvider>
                {children}
        </SessionProvider>
    );
}
