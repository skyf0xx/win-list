'use client';

import { Task, Category } from '@/generated/prisma';
import { TaskStatusSection } from './task-status-section';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useUpdateTask, useBulkUpdateTaskOrder } from '@/hooks/api';

interface TaskSectionsProps {
    pendingTasks: Task[];
    inProgressTasks: Task[];
    completedTasks: Task[];
    categories: Category[];
    counts: {
        pending: number;
        inProgress: number;
        completed: number;
        total: number;
    };
    onTaskClick?: (task: Task) => void;
    loading?: boolean;
    className?: string;
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
const STATUS_VALUES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export function TaskSections({
    pendingTasks,
    inProgressTasks,
    completedTasks,
    categories,
    counts,
    onTaskClick,
    loading = false,
    className,
}: TaskSectionsProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    const updateTaskMutation = useUpdateTask();
    const bulkUpdateMutation = useBulkUpdateTaskOrder();

    // Configure sensors for better touch/mouse support
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px of movement required to start drag
            },
        })
    );

    // Find task by ID across all sections
    const findTask = (id: string): Task | undefined => {
        return [...pendingTasks, ...inProgressTasks, ...completedTasks].find(
            (task) => task.id === id
        );
    };

    // Get current status of a task
    const getTaskStatus = (taskId: string): TaskStatus | null => {
        if (pendingTasks.find((t) => t.id === taskId)) return 'PENDING';
        if (inProgressTasks.find((t) => t.id === taskId)) return 'IN_PROGRESS';
        if (completedTasks.find((t) => t.id === taskId)) return 'COMPLETED';
        return null;
    };

    // Get tasks by status
    const getTasksByStatus = (status: TaskStatus): Task[] => {
        switch (status) {
            case 'PENDING':
                return pendingTasks;
            case 'IN_PROGRESS':
                return inProgressTasks;
            case 'COMPLETED':
                return completedTasks;
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        const task = findTask(active.id as string);
        setDraggedTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveId(null);
        setDraggedTask(null);

        if (!over) return;

        const activeTaskId = active.id as string;
        const activeTask = findTask(activeTaskId);
        if (!activeTask) return;

        const overId = over.id as string;
        const activeTaskStatus = getTaskStatus(activeTaskId);
        if (!activeTaskStatus) return;

        // Check if we're dropping on a status section (status change)
        if (STATUS_VALUES.includes(overId as TaskStatus)) {
            const newStatus = overId as TaskStatus;

            // If status is different, change the task status
            if (activeTaskStatus !== newStatus) {
                try {
                    await updateTaskMutation.mutateAsync({
                        id: activeTaskId,
                        data: { status: newStatus },
                    });
                } catch (error) {
                    console.error('Failed to update task status:', error);
                }
            }
            return;
        }

        // Check if we're dropping on another task (reordering)
        const overTask = findTask(overId);
        if (overTask) {
            const overTaskStatus = getTaskStatus(overId);

            // Only reorder if both tasks are in the same status
            if (activeTaskStatus === overTaskStatus) {
                await handleReorder(activeTaskId, overId, activeTaskStatus);
            } else if (overTaskStatus) {
                // If different status and overTaskStatus is not null, change the active task's status
                try {
                    await updateTaskMutation.mutateAsync({
                        id: activeTaskId,
                        data: { status: overTaskStatus },
                    });
                } catch (error) {
                    console.error('Failed to update task status:', error);
                }
            }
        }
    };

    const handleReorder = async (
        activeTaskId: string,
        overTaskId: string,
        status: TaskStatus
    ) => {
        if (activeTaskId === overTaskId) return;

        // Get the task list for the current status
        const taskList = [...getTasksByStatus(status)];

        // Sort by current sortOrder to ensure correct order
        taskList.sort((a, b) => a.sortOrder - b.sortOrder);

        // Find indices
        const activeIndex = taskList.findIndex(
            (task) => task.id === activeTaskId
        );
        const overIndex = taskList.findIndex((task) => task.id === overTaskId);

        if (activeIndex === -1 || overIndex === -1) return;

        // Reorder the list
        const reorderedTasks = [...taskList];
        const [movedTask] = reorderedTasks.splice(activeIndex, 1);
        reorderedTasks.splice(overIndex, 0, movedTask);

        // Create bulk update data with new sort orders
        const taskUpdates = reorderedTasks.map((task, index) => ({
            id: task.id,
            sortOrder: index,
        }));

        try {
            await bulkUpdateMutation.mutateAsync({ taskUpdates });
        } catch (error) {
            console.error('Failed to reorder tasks:', error);
        }
    };

    // Create category map for quick lookup
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    if (loading) {
        return (
            <div className={cn('space-y-6', className)}>
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={cn('space-y-6', className)}>
                <TaskStatusSection
                    status="PENDING"
                    tasks={pendingTasks}
                    categories={categories}
                    count={counts.pending}
                    onTaskClick={onTaskClick}
                />

                <TaskStatusSection
                    status="IN_PROGRESS"
                    tasks={inProgressTasks}
                    categories={categories}
                    count={counts.inProgress}
                    onTaskClick={onTaskClick}
                />

                <TaskStatusSection
                    status="COMPLETED"
                    tasks={completedTasks}
                    categories={categories}
                    count={counts.completed}
                    onTaskClick={onTaskClick}
                />
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeId && draggedTask ? (
                    <TaskCard
                        task={draggedTask}
                        category={
                            draggedTask.categoryId
                                ? categoryMap.get(draggedTask.categoryId)
                                : undefined
                        }
                        draggable={false}
                        isOverlay={true}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
