'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Check, Palette } from 'lucide-react';

interface ProfileCreateFormProps {
    onSubmit: (data: { name: string; color?: string }) => void;
    onCancel: () => void;
    loading?: boolean;
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

export function ProfileCreateForm({
    onSubmit,
    onCancel,
    loading = false,
}: ProfileCreateFormProps) {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState<string>(
        PRESET_COLORS[0]
    );
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit({
                name: name.trim(),
                color: selectedColor,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                        Create New Profile
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Profile Name Input */}
                <div>
                    <label
                        htmlFor="profile-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Profile Name
                    </label>
                    <Input
                        id="profile-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., Work, Personal"
                        disabled={loading}
                        autoFocus
                        className="w-full"
                        maxLength={50}
                    />
                </div>

                {/* Color Selection */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Color
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                            disabled={loading}
                        >
                            <Palette className="h-3 w-3" />
                            {showColorPicker ? 'Hide' : 'More'}
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

                    {/* Color Options */}
                    {showColorPicker && (
                        <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                        selectedColor === color
                                            ? 'border-gray-800 ring-2 ring-gray-300'
                                            : 'border-white shadow-sm ring-1 ring-gray-200'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    disabled={loading}
                                    title={color}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={!name.trim() || loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        size="sm"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Create
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        size="sm"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
