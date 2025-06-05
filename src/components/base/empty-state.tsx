import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    CheckCircle,
    Clock,
    Plus,
    Search,
    User,
    FolderOpen,
    ListTodo,
} from 'lucide-react';

interface EmptyStateProps {
    type:
        | 'tasks'
        | 'pending'
        | 'inProgress'
        | 'completed'
        | 'search'
        | 'profiles'
        | 'categories'
        | 'general';
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    type,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const config = getEmptyStateConfig(type);

    const finalTitle = title || config.title;
    const finalDescription = description || config.description;
    const Icon = config.icon;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            <div className={cn('rounded-full p-3 mb-4', config.iconBgColor)}>
                <Icon className={cn('h-8 w-8', config.iconColor)} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {finalTitle}
            </h3>

            <p className="text-sm text-gray-500 mb-6 max-w-sm">
                {finalDescription}
            </p>

            {action && (
                <Button onClick={action.onClick} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {action.label}
                </Button>
            )}
        </div>
    );
}

function getEmptyStateConfig(type: EmptyStateProps['type']) {
    const configs = {
        tasks: {
            icon: ListTodo,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
            title: 'No tasks yet',
            description:
                'Create your first task to get started with organizing your work.',
        },
        pending: {
            icon: Clock,
            iconColor: 'text-amber-600',
            iconBgColor: 'bg-amber-50',
            title: 'No pending tasks',
            description:
                "Great! You don't have any pending tasks right now. Keep up the good work!",
        },
        inProgress: {
            icon: ListTodo,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
            title: 'No tasks in progress',
            description:
                'Move some pending tasks here when you start working on them.',
        },
        completed: {
            icon: CheckCircle,
            iconColor: 'text-green-600',
            iconBgColor: 'bg-green-50',
            title: 'No completed tasks',
            description:
                'Tasks you complete will appear here. Start checking off those to-dos!',
        },
        search: {
            icon: Search,
            iconColor: 'text-gray-600',
            iconBgColor: 'bg-gray-50',
            title: 'No results found',
            description:
                'Try adjusting your search terms or check the spelling.',
        },
        profiles: {
            icon: User,
            iconColor: 'text-purple-600',
            iconBgColor: 'bg-purple-50',
            title: 'No profiles yet',
            description:
                'Create your first profile to start organizing your tasks by context.',
        },
        categories: {
            icon: FolderOpen,
            iconColor: 'text-indigo-600',
            iconBgColor: 'bg-indigo-50',
            title: 'No categories yet',
            description:
                'Create categories to better organize your tasks by type or project.',
        },
        general: {
            icon: ListTodo,
            iconColor: 'text-gray-600',
            iconBgColor: 'bg-gray-50',
            title: 'Nothing here yet',
            description:
                'This section is empty. Add some content to get started.',
        },
    };

    return configs[type];
}
