import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    className,
}: Readonly<BadgeProps>) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                {
                    'bg-primary/10 text-primary ring-primary/20':
                        variant === 'default',
                    'bg-secondary text-secondary-foreground ring-border':
                        variant === 'secondary',
                    'bg-success/10 text-success ring-success/20':
                        variant === 'success',
                    'bg-warning/10 text-warning ring-warning/20':
                        variant === 'warning',
                    'bg-destructive/10 text-destructive ring-destructive/20':
                        variant === 'destructive',
                },
                className
            )}
        >
            {children}
        </span>
    );
}
