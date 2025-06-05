'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, X } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

export function DatePicker({
    value,
    onChange,
    disabled = false,
    minDate,
    maxDate,
}: DatePickerProps) {
    const [showQuickOptions, setShowQuickOptions] = useState(false);

    const today = startOfToday();
    const quickOptions = [
        { label: 'Today', date: today },
        { label: 'Tomorrow', date: addDays(today, 1) },
        { label: 'This Weekend', date: addDays(today, 6 - today.getDay()) },
        { label: 'Next Week', date: addDays(today, 7) },
    ];

    const handleQuickSelect = (date: Date) => {
        onChange(format(date, 'yyyy-MM-dd'));
        setShowQuickOptions(false);
    };

    const handleClear = () => {
        onChange('');
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
                    max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
                    className="flex-1"
                />

                {value && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleClear}
                        disabled={disabled}
                        title="Clear date"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuickOptions(!showQuickOptions)}
                    disabled={disabled}
                    className="gap-2"
                >
                    <Calendar className="h-4 w-4" />
                    Quick
                </Button>
            </div>

            {value && (
                <p className="text-sm text-gray-600">
                    Selected: {formatDisplayDate(value)}
                </p>
            )}

            {showQuickOptions && (
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50">
                    {quickOptions.map((option) => (
                        <Button
                            key={option.label}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickSelect(option.date)}
                            disabled={disabled}
                            className="justify-start"
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
