'use client';

import { useState } from 'react';
import { Category } from '@/generated/prisma';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check, X, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateCategory } from '@/hooks/api';

interface CategorySelectorProps {
    categories: Category[];
    value: string; // Category ID
    onChange: (categoryId: string) => void;
    disabled?: boolean;
    profileId?: string; // Required for creating new categories
}

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
];

export function CategorySelector({
    categories,
    value,
    onChange,
    disabled = false,
    profileId,
}: CategorySelectorProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const createCategoryMutation = useCreateCategory();

    // Convert empty string to "none" for the Select component
    const selectValue = value || 'none';
    const selectedCategory = categories.find((cat) => cat.id === value);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || !profileId) return;

        try {
            const newCategory = await createCategoryMutation.mutateAsync({
                profileId,
                name: newCategoryName.trim(),
                color: selectedColor,
            });

            // Select the newly created category
            onChange(newCategory.id);

            // Reset form
            setNewCategoryName('');
            setSelectedColor(PRESET_COLORS[0]);
            setShowCreateForm(false);
            setShowColorPicker(false);
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleCancelCreate = () => {
        setNewCategoryName('');
        setSelectedColor(PRESET_COLORS[0]);
        setShowCreateForm(false);
        setShowColorPicker(false);
    };

    const handleValueChange = (newValue: string) => {
        if (newValue === 'create-new') {
            setShowCreateForm(true);
        } else if (newValue === 'none') {
            onChange(''); // Convert back to empty string for the form
        } else {
            onChange(newValue);
        }
    };

    if (showCreateForm) {
        return (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900">
                        Create New Category
                    </Label>
                    <button
                        type="button"
                        onClick={handleCancelCreate}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={createCategoryMutation.isPending}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Category Name Input */}
                <div>
                    <Label
                        htmlFor="category-name"
                        className="text-sm text-gray-700"
                    >
                        Category Name
                    </Label>
                    <Input
                        id="category-name"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Work, Personal, Shopping"
                        disabled={createCategoryMutation.isPending}
                        autoFocus
                        maxLength={50}
                        className="mt-1"
                    />
                </div>

                {/* Color Selection */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm text-gray-700">Color</Label>
                        <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            disabled={createCategoryMutation.isPending}
                        >
                            <Palette className="h-3 w-3" />
                            {showColorPicker ? 'Hide' : 'Show Colors'}
                        </button>
                    </div>

                    {/* Color Preview */}
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                            style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm text-gray-600">
                            {selectedColor}
                        </span>
                    </div>

                    {/* Color Picker */}
                    {showColorPicker && (
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                                        selectedColor === color
                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                            : 'border-white shadow-sm ring-1 ring-gray-200'
                                    )}
                                    style={{ backgroundColor: color }}
                                    disabled={createCategoryMutation.isPending}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={
                            !newCategoryName.trim() ||
                            createCategoryMutation.isPending
                        }
                        size="sm"
                        className="flex-1"
                    >
                        {createCategoryMutation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Create Category
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelCreate}
                        disabled={createCategoryMutation.isPending}
                        size="sm"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Select
            value={selectValue}
            onValueChange={handleValueChange}
            disabled={disabled}
        >
            <SelectTrigger>
                <SelectValue placeholder="Select category">
                    {selectedCategory ? (
                        <div className="flex items-center gap-2">
                            {selectedCategory.color && (
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{
                                        backgroundColor: selectedCategory.color,
                                    }}
                                />
                            )}
                            <span className="truncate">
                                {selectedCategory.name}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-500">No category</span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {/* No Category Option */}
                <SelectItem value="none">
                    <span className="text-gray-500">No category</span>
                </SelectItem>

                {/* Existing Categories */}
                {categories.length > 0 && (
                    <>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                    {category.color && (
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: category.color,
                                            }}
                                        />
                                    )}
                                    <span className="truncate">
                                        {category.name}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </>
                )}

                {/* Create New Category Option */}
                {profileId && (
                    <>
                        <div className="h-px bg-gray-200 my-1" />
                        <SelectItem
                            value="create-new"
                            className="text-blue-600 focus:text-blue-600"
                        >
                            <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3" />
                                <span>Create New Category</span>
                            </div>
                        </SelectItem>
                    </>
                )}
            </SelectContent>
        </Select>
    );
}
