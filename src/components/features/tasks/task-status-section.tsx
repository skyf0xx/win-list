'use client';

import { Task, Category } from '@/generated/prisma';
import { TaskList } from './task-list';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface TaskStatusSectionProps {
    status: TaskStatus;
    tasks: Task[];
    categories: Category[];
    count: number;
    onTaskClick?: (task: Task) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
}

const STATUS_CONFIG = {
    PENDING: {
        title: 'Pending',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        emptyMessage: 'No pending tasks! 🎉',
        emptyDescription: 'All caught up with your pending work.',
    },
    IN_PROGRESS: {
        title: 'In Progress',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emptyMessage: 'Nothing in progress',
        emptyDescription: 'Start working on a pending task to see it here.',
    },
    COMPLETED: {
        title: 'Completed',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        emptyMessage: 'No completed tasks yet',
        emptyDescription: 'Complete some tasks to see your progress here.',
    },
};

export function TaskStatusSection({
    status,
    tasks,
    categories,
    count,
    onTaskClick,
    collapsed = false,
    onToggleCollapse,
    className,
}: TaskStatusSectionProps) {
    const config = STATUS_CONFIG[status];
    const [internalCollapsed, setInternalCollapsed] = useState(
        status === 'COMPLETED' && tasks.length > 3
    );

    const isCollapsed = onToggleCollapse ? collapsed : internalCollapsed;
    const handleToggleCollapse =
        onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

    // For completed tasks, show only first 3 when collapsed
    const displayTasks =
        isCollapsed && status === 'COMPLETED' ? tasks.slice(0, 3) : tasks;

    const showCollapseToggle = status === 'COMPLETED' && tasks.length > 3;

    return (
        <section
            className={cn(
                'bg-white border rounded-lg overflow-hidden',
                config.borderColor,
                className
            )}
        >
            {/* Section Header */}
            <div
                className={cn(
                    'px-4 py-3 border-b flex items-center justify-between',
                    config.bgColor,
                    config.borderColor
                )}
            >
                <div className="flex items-center gap-2">
                    <h2 className={cn('font-semibold text-lg', config.color)}>
                        {config.title}
                    </h2>
                    <span
                        className={cn(
                            'inline-flex items-center justify-center min-w-[24px] h-6 px-2',
                            'text-sm font-medium rounded-full',
                            config.color,
                            'bg-white/80'
                        )}
                    >
                        {count}
                    </span>
                </div>

                {/* Collapse Toggle for Completed */}
                {showCollapseToggle && (
                    <button
                        onClick={handleToggleCollapse}
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            'hover:opacity-75 transition-opacity',
                            config.color
                        )}
                    >
                        <span>{isCollapsed ? 'Show all' : 'Show less'}</span>
                        {isCollapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Section Content */}
            <div className="p-4">
                {tasks.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-8">
                        <p className="text-gray-600 font-medium mb-1">
                            {config.emptyMessage}
                        </p>
                        <p className="text-sm text-gray-500">
                            {config.emptyDescription}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Task List */}
                        <TaskList
                            tasks={displayTasks}
                            categories={categories}
                            onTaskClick={onTaskClick}
                            draggable={true}
                        />

                        {/* Show More Indicator */}
                        {isCollapsed &&
                            status === 'COMPLETED' &&
                            tasks.length > 3 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={handleToggleCollapse}
                                        className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                                    >
                                        And {tasks.length - 3} more completed
                                        task{tasks.length - 3 !== 1 ? 's' : ''}
                                        ...
                                    </button>
                                </div>
                            )}
                    </>
                )}
            </div>
        </section>
    );
}
