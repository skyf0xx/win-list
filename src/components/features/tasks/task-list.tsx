'use client';

import { Task, Category } from '@/generated/prisma';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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

    // Sort tasks by sortOrder for consistent drag and drop
    const sortedTasks = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div className={cn('space-y-3', className)}>
            {draggable ? (
                <SortableContext
                    items={sortedTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sortedTasks.map((task) => (
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
                </SortableContext>
            ) : (
                sortedTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        category={
                            task.categoryId
                                ? categoryMap.get(task.categoryId)
                                : undefined
                        }
                        onClick={() => onTaskClick?.(task)}
                        draggable={false}
                    />
                ))
            )}
        </div>
    );
}
