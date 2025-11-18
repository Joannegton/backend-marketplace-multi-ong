'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/atoms/badge';
import { DashboardStats } from '@/components/organisms/dashboard-stats';

const recentOrders = [
    {
        id: 'ORD-001',
        customer: 'João Silva',
        total: 159.9,
        status: 'pending' as const,
    },
    {
        id: 'ORD-002',
        customer: 'Maria Santos',
        total: 89.9,
        status: 'paid' as const,
    },
    {
        id: 'ORD-003',
        customer: 'Pedro Costa',
        total: 245,
        status: 'paid' as const,
    },
    {
        id: 'ORD-004',
        customer: 'Ana Oliveira',
        total: 125.5,
        status: 'pending' as const,
    },
];

const lowStockProducts = [
    { name: 'Chapéu de Palha', stock: 3 },
    { name: 'Cesta de Artesanato', stock: 5 },
    { name: 'Bolsa Ecológica', stock: 7 },
];

export default function AdminDashboardPage() {
    return (
        <div className="p-8 space-y-8">
            <DashboardStats
                stats={{
                    totalProducts: 48,
                    activeProducts: 42,
                    newOrders: 12,
                    lowStock: 3,
                }}
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pedidos Recentes</CardTitle>
                        <CardDescription>
                            Últimos pedidos recebidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {order.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.customer}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-sm">
                                            R$ {order.total.toFixed(2)}
                                        </span>
                                        <Badge
                                            variant={
                                                order.status === 'paid'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        >
                                            {order.status === 'paid'
                                                ? 'Pago'
                                                : 'Pendente'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Estoque Baixo</CardTitle>
                        <CardDescription>
                            Produtos que precisam de reposição
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lowStockProducts.map((product) => (
                                <div
                                    key={product.name}
                                    className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <p className="text-sm font-medium">
                                        {product.name}
                                    </p>
                                    <Badge variant="warning">
                                        {product.stock} unidades
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
