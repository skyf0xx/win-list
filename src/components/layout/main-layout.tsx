import { cn } from '@/lib/utils';

interface MainLayoutProps {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
}

export function MainLayout({
    children,
    loading = false,
    className,
}: MainLayoutProps) {
    return (
        <main
            className={cn(
                'container mx-auto px-4 py-6',
                'min-h-[calc(100vh-80px)]',
                loading && 'opacity-50 pointer-events-none',
                className
            )}
        >
            {children}
        </main>
    );
}
