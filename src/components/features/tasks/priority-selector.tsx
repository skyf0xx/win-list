'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PrioritySelectorProps {
    value: 'LOW' | 'MEDIUM' | 'HIGH';
    onChange: (value: 'LOW' | 'MEDIUM' | 'HIGH') => void;
    disabled?: boolean;
}

export function PrioritySelector({
    value,
    onChange,
    disabled = false,
}: PrioritySelectorProps) {
    const priorityConfig = {
        HIGH: { label: 'High', color: 'bg-red-500', textColor: 'text-red-600' },
        MEDIUM: {
            label: 'Medium',
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
        },
        LOW: { label: 'Low', color: 'bg-gray-400', textColor: 'text-gray-600' },
    };

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue>
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                'w-3 h-3 rounded-full',
                                priorityConfig[value].color
                            )}
                        />
                        <span>{priorityConfig[value].label}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {Object.entries(priorityConfig).map(([priority, config]) => (
                    <SelectItem
                        key={priority}
                        value={priority}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'w-3 h-3 rounded-full',
                                    config.color
                                )}
                            />
                            <span>{config.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
