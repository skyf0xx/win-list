'use client';

import { Task, Category } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { Calendar, Clock, GripVertical } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
    task: Task;
    category?: Category;
    onClick?: () => void;
    draggable?: boolean;
    className?: string;
}

export function TaskCard({
    task,
    category,
    onClick,
    draggable = true,
    className,
}: TaskCardProps) {
    const isOverdue =
        task.dueDate && isPast(task.dueDate) && task.status !== 'COMPLETED';
    const isCompleted = task.status === 'COMPLETED';

    const formatDueDate = (dateString: string) => {
        const date = parseISO(dateString);

        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`;

        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return `${diffDays} day${diffDays === 1 ? '' : 's'}`;

        return format(date, 'MMM d, yyyy');
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-500';
            case 'MEDIUM':
                return 'bg-amber-500';
            case 'LOW':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div
            className={cn(
                'group relative bg-white border border-gray-200 rounded-lg p-4',
                'hover:shadow-md hover:border-gray-300 transition-all duration-200',
                'cursor-pointer select-none',
                isOverdue && 'border-l-4 border-l-red-500',
                isCompleted && 'opacity-60',
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Drag Handle */}
                {draggable && (
                    <div
                        className={cn(
                            'flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100',
                            'transition-opacity duration-200 cursor-grab active:cursor-grabbing',
                            'text-gray-400 hover:text-gray-600'
                        )}
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3
                        className={cn(
                            'font-medium text-gray-900 text-sm leading-tight',
                            'truncate',
                            isCompleted && 'line-through text-gray-500'
                        )}
                    >
                        {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                        <p
                            className={cn(
                                'text-xs text-gray-600 mt-1 line-clamp-2',
                                isCompleted && 'text-gray-400'
                            )}
                        >
                            {task.description}
                        </p>
                    )}

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 mt-2">
                        {/* Category Badge */}
                        {category && (
                            <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{
                                    backgroundColor:
                                        category.color || '#6B7280',
                                }}
                            >
                                {category.name}
                            </span>
                        )}

                        {/* Priority Indicator */}
                        <div className="flex items-center gap-1">
                            <div
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    getPriorityColor(task.priority)
                                )}
                            />
                            <span className="text-xs text-gray-500 capitalize">
                                {task.priority.toLowerCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Due Date */}
                {task.dueDate && (
                    <div
                        className={cn(
                            'flex-shrink-0 text-right',
                            isOverdue ? 'text-red-600' : 'text-gray-500'
                        )}
                    >
                        <div className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            <span
                                className={cn(
                                    'font-medium',
                                    isOverdue && 'font-semibold'
                                )}
                            >
                                {formatDueDate(task.dueDate.toString())}
                            </span>
                        </div>
                        {isOverdue && (
                            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>Overdue</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Indicator for completed tasks */}
            {isCompleted && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
            )}
        </div>
    );
}
