'use client';

import { Task, Category } from '@/generated/prisma';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';

interface TaskListProps {
    tasks: Task[];
    categories: Category[];
    onTaskClick?: (task: Task) => void;
    className?: string;
    draggable?: boolean;
    emptyMessage?: string;
}

export function TaskList({
    tasks,
    categories,
    onTaskClick,
    className,
    draggable = true,
    emptyMessage = 'No tasks',
}: TaskListProps) {
    // Create a map for quick category lookup
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    if (tasks.length === 0) {
        return (
            <div
                className={cn(
                    'text-center py-6 text-sm text-gray-500',
                    className
                )}
            >
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    category={
                        task.categoryId
                            ? categoryMap.get(task.categoryId)
                            : undefined
                    }
                    onClick={() => onTaskClick?.(task)}
                    draggable={draggable}
                />
            ))}
        </div>
    );
}
