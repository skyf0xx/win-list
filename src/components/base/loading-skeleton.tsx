import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    variant?: 'task' | 'profile' | 'category' | 'header' | 'text' | 'circle';
    count?: number;
    height?: string;
    className?: string;
}

export function LoadingSkeleton({
    variant = 'text',
    count = 1,
    height,
    className,
}: LoadingSkeletonProps) {
    const skeletons = Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            className={getSkeletonClasses(variant, height, className)}
        />
    ));

    if (variant === 'task') {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }, (_, index) => (
                    <TaskSkeleton key={index} className={className} />
                ))}
            </div>
        );
    }

    if (variant === 'header') {
        return <HeaderSkeleton className={className} />;
    }

    return <div className="space-y-2">{skeletons}</div>;
}

function TaskSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'rounded-lg border bg-white p-4 shadow-sm',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    {/* Task title */}
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />

                    {/* Task description */}
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />

                    {/* Category and priority row */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="h-6 bg-blue-100 rounded-full animate-pulse w-16" />
                        <div className="h-3 w-3 bg-amber-200 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Due date */}
                <div className="h-4 bg-gray-100 rounded animate-pulse w-16 ml-4" />
            </div>
        </div>
    );
}

function HeaderSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex items-center justify-between p-4 bg-white border-b',
                className
            )}
        >
            {/* Left side - Profile selector */}
            <div className="flex items-center gap-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
                <div className="h-10 bg-gray-100 rounded animate-pulse w-64" />
            </div>

            {/* Right side - New task button */}
            <div className="h-10 bg-blue-100 rounded animate-pulse w-24" />
        </div>
    );
}

function getSkeletonClasses(
    variant: LoadingSkeletonProps['variant'],
    height?: string,
    className?: string
): string {
    const baseClasses = 'bg-gray-200 rounded animate-pulse';

    const variantClasses = {
        text: 'h-4 w-full',
        circle: 'h-8 w-8 rounded-full',
        profile: 'h-6 w-24',
        category: 'h-6 w-16 rounded-full',
        task: 'h-20 w-full', // This won't be used due to custom TaskSkeleton
        header: 'h-16 w-full', // This won't be used due to custom HeaderSkeleton
    };

    const heightClass = height ? `h-[${height}]` : variantClasses[variant!];

    return cn(baseClasses, heightClass, className);
}
