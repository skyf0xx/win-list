'use client';

import { useState, useEffect } from 'react';
import { Task, Category } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import { TaskDeleteConfirmation } from './task-delete-confirmation';
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validations';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/api';

interface TaskModalProps {
    isOpen: boolean;
    task?: Task | null;
    categories: Category[];
    profileId: string | null;
    onClose: () => void;
    onSuccess?: (task: Task) => void;
}

export function TaskModal({
    isOpen,
    task,
    categories,
    profileId,
    onClose,
    onSuccess,
}: TaskModalProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    const isEditing = !!task;
    const isLoading =
        createTaskMutation.isPending || updateTaskMutation.isPending;

    // Reset delete confirmation when modal closes
    useEffect(() => {
        if (!isOpen) {
            setShowDeleteConfirm(false);
        }
    }, [isOpen]);

    const handleSubmit = async (
        formData: CreateTaskInput | UpdateTaskInput
    ) => {
        if (!profileId) return;

        try {
            let savedTask: Task;

            if (isEditing && task) {
                savedTask = await updateTaskMutation.mutateAsync({
                    id: task.id,
                    data: formData as UpdateTaskInput,
                });
            } else {
                savedTask = await createTaskMutation.mutateAsync({
                    profileId,
                    ...formData,
                } as CreateTaskInput);
            }

            onSuccess?.(savedTask);
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            // Error handling is done in the mutations
        }
    };

    const handleDelete = async () => {
        if (!task) return;

        try {
            await deleteTaskMutation.mutateAsync(task.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !showDeleteConfirm && !isLoading) {
            onClose();
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent
                    className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                    onKeyDown={handleKeyDown}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the task details below.'
                                : 'Fill in the details for your new task.'}
                        </DialogDescription>
                    </DialogHeader>

                    {profileId && (
                        <TaskForm
                            initialData={task}
                            categories={categories}
                            profileId={profileId}
                            onSubmit={handleSubmit}
                            loading={isLoading}
                        />
                    )}

                    {isEditing && (
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={
                                    isLoading || deleteTaskMutation.isPending
                                }
                                className="w-full sm:w-auto"
                            >
                                Delete Task
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            <TaskDeleteConfirmation
                isOpen={showDeleteConfirm}
                taskTitle={task?.title || ''}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                loading={deleteTaskMutation.isPending}
            />
        </>
    );
}
