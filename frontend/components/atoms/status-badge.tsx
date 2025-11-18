import { OrderStatus } from '@/lib/types';
import { Badge } from './badge';

interface StatusBadgeProps {
    status: OrderStatus;
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
    const statusConfig = {
        [OrderStatus.PENDING]: {
            variant: 'warning' as const,
            label: 'Pendente',
        },
        [OrderStatus.PROCESSING]: {
            variant: 'default' as const,
            label: 'Processando',
        },
        [OrderStatus.COMPLETED]: {
            variant: 'success' as const,
            label: 'Concluído',
        },
        [OrderStatus.CANCELLED]: {
            variant: 'destructive' as const,
            label: 'Cancelado',
        },
    };

    const config = statusConfig[status];

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
