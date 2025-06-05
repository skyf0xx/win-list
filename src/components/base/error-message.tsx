import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Wifi, RefreshCw, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorMessageProps {
    variant?: 'error' | 'warning' | 'network' | 'info';
    title?: string;
    message: string;
    details?: string;
    retry?: {
        label?: string;
        onClick: () => void;
        loading?: boolean;
    };
    className?: string;
    compact?: boolean;
}

export function ErrorMessage({
    variant = 'error',
    title,
    message,
    details,
    retry,
    className,
    compact = false,
}: ErrorMessageProps) {
    const config = getErrorConfig(variant);
    const finalTitle = title || config.title;

    if (compact) {
        return (
            <div
                className={cn(
                    'flex items-center gap-2 p-3 rounded-md border text-sm',
                    config.containerClasses,
                    className
                )}
            >
                <config.icon
                    className={cn('h-4 w-4 flex-shrink-0', config.iconColor)}
                />
                <span className={config.textColor}>{message}</span>
                {retry && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={retry.onClick}
                        disabled={retry.loading}
                        className="ml-auto h-6 px-2"
                    >
                        <RefreshCw
                            className={cn(
                                'h-3 w-3',
                                retry.loading && 'animate-spin'
                            )}
                        />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
        >
            <div className={cn('rounded-full p-3 mb-4', config.iconBgColor)}>
                <config.icon className={cn('h-8 w-8', config.iconColor)} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {finalTitle}
            </h3>

            <p className={cn('text-sm mb-2 max-w-sm', config.textColor)}>
                {message}
            </p>

            {details && (
                <p className="text-xs text-gray-400 mb-6 max-w-sm font-mono">
                    {details}
                </p>
            )}

            {retry && (
                <Button
                    variant="outline"
                    onClick={retry.onClick}
                    disabled={retry.loading}
                    className="gap-2"
                >
                    <RefreshCw
                        className={cn(
                            'h-4 w-4',
                            retry.loading && 'animate-spin'
                        )}
                    />
                    {retry.loading ? 'Retrying...' : retry.label || 'Try Again'}
                </Button>
            )}
        </div>
    );
}

function getErrorConfig(variant: ErrorMessageProps['variant']) {
    const configs = {
        error: {
            icon: XCircle,
            iconColor: 'text-red-600',
            iconBgColor: 'bg-red-50',
            textColor: 'text-red-600',
            containerClasses: 'bg-red-50 border-red-200',
            title: 'Something went wrong',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
            iconBgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            containerClasses: 'bg-amber-50 border-amber-200',
            title: 'Warning',
        },
        network: {
            icon: Wifi,
            iconColor: 'text-orange-600',
            iconBgColor: 'bg-orange-50',
            textColor: 'text-orange-700',
            containerClasses: 'bg-orange-50 border-orange-200',
            title: 'Connection Problem',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            containerClasses: 'bg-blue-50 border-blue-200',
            title: 'Information',
        },
    };

    return configs[variant!];
}

// Specific error components for common use cases
export function NetworkError({
    onRetry,
    loading = false,
    className,
}: {
    onRetry: () => void;
    loading?: boolean;
    className?: string;
}) {
    return (
        <ErrorMessage
            variant="network"
            message="Unable to connect to the server. Please check your internet connection."
            retry={{
                onClick: onRetry,
                loading,
            }}
            className={className}
        />
    );
}

export function LoadingError({
    resource = 'data',
    onRetry,
    loading = false,
    className,
}: {
    resource?: string;
    onRetry: () => void;
    loading?: boolean;
    className?: string;
}) {
    return (
        <ErrorMessage
            message={`Failed to load ${resource}. Please try again.`}
            retry={{
                onClick: onRetry,
                loading,
            }}
            className={className}
        />
    );
}

export function ValidationError({
    message,
    className,
}: {
    message: string;
    className?: string;
}) {
    return (
        <ErrorMessage
            variant="warning"
            message={message}
            compact
            className={className}
        />
    );
}
