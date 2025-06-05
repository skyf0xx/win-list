'use client';

import { useState, useEffect } from 'react';
import { Task, Category } from '@/generated/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PrioritySelector } from './priority-selector';
import { DatePicker } from './date-picker';
import { CreateTaskInput, UpdateTaskInput } from '@/lib/validations';
import { format } from 'date-fns';
import { CategorySelector } from '@/components/categories/category-selector';

interface TaskFormProps {
    initialData?: Task | null;
    categories: Category[];
    profileId: string;
    onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
    loading?: boolean;
}

export function TaskForm({
    initialData,
    categories,
    profileId,
    onSubmit,
    loading = false,
}: TaskFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
        status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
        dueDate: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form with initial data when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                categoryId: initialData.categoryId || '',
                priority: initialData.priority || 'MEDIUM',
                status: initialData.status || 'PENDING',
                dueDate: initialData.dueDate
                    ? format(new Date(initialData.dueDate), 'yyyy-MM-dd')
                    : '',
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Task title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be 200 characters or less';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description =
                'Description must be 1000 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const submitData: CreateTaskInput | UpdateTaskInput = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            categoryId: formData.categoryId || undefined,
            priority: formData.priority,
            status: formData.status,
            dueDate: formData.dueDate || undefined,
        };

        onSubmit(submitData);
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                </Label>
                <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="What needs to be done?"
                    disabled={loading}
                    autoFocus
                    maxLength={200}
                    className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <Label htmlFor="description" className="text-sm font-medium">
                    Description
                </Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        handleChange('description', e.target.value)
                    }
                    placeholder="Add more details about this task..."
                    disabled={loading}
                    rows={3}
                    maxLength={1000}
                    className={errors.description ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {errors.description && (
                        <span className="text-red-600">
                            {errors.description}
                        </span>
                    )}
                    <span className="ml-auto">
                        {formData.description.length}/1000
                    </span>
                </div>
            </div>

            {/* Category */}
            <div>
                <Label className="text-sm font-medium">Category</Label>
                <CategorySelector
                    categories={categories}
                    value={formData.categoryId}
                    onChange={(value: string) =>
                        handleChange('categoryId', value)
                    }
                    disabled={loading}
                    profileId={profileId}
                />
            </div>

            {/* Priority and Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <PrioritySelector
                        value={formData.priority}
                        onChange={(value: string) =>
                            handleChange('priority', value)
                        }
                        disabled={loading}
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                                In Progress
                            </SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date */}
            <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <DatePicker
                    value={formData.dueDate}
                    onChange={(value: string) => handleChange('dueDate', value)}
                    disabled={loading}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    className="min-w-[120px]"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {initialData ? 'Updating...' : 'Creating...'}
                        </>
                    ) : initialData ? (
                        'Update Task'
                    ) : (
                        'Create Task'
                    )}
                </Button>
            </div>
        </form>
    );
}
