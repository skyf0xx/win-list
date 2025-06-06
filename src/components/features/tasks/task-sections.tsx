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

        const taskId = active.id as string;
        const task = findTask(taskId);
        if (!task) return;

        const currentStatus = getTaskStatus(taskId);
        const newStatus = over.id as TaskStatus;

        // If dropped on the same status section, handle reordering
        if (currentStatus === newStatus) {
            await handleReorder(event);
            return;
        }

        // If dropped on different status section, change status
        if (['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus)) {
            try {
                await updateTaskMutation.mutateAsync({
                    id: taskId,
                    data: { status: newStatus },
                });
            } catch (error) {
                console.error('Failed to update task status:', error);
            }
        }
    };

    const handleReorder = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeTask = findTask(active.id as string);
        const overTask = findTask(over.id as string);

        if (!activeTask || !overTask) return;

        const currentStatus = getTaskStatus(active.id as string);
        if (!currentStatus) return;

        // Get the current task list for reordering
        let taskList: Task[] = [];
        switch (currentStatus) {
            case 'PENDING':
                taskList = [...pendingTasks];
                break;
            case 'IN_PROGRESS':
                taskList = [...inProgressTasks];
                break;
            case 'COMPLETED':
                taskList = [...completedTasks];
                break;
        }

        // Sort by current sortOrder
        taskList.sort((a, b) => a.sortOrder - b.sortOrder);

        // Find indices
        const activeIndex = taskList.findIndex((task) => task.id === active.id);
        const overIndex = taskList.findIndex((task) => task.id === over.id);

        if (activeIndex === -1 || overIndex === -1) return;

        // Reorder the list
        const reorderedTasks = [...taskList];
        const [movedTask] = reorderedTasks.splice(activeIndex, 1);
        reorderedTasks.splice(overIndex, 0, movedTask);

        // Create bulk update data
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
