import { Package, ShoppingBag, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
}

function StatsCard({ title, value, icon, trend }: Readonly<StatsCardProps>) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface DashboardStatsProps {
    stats?: {
        totalProducts: number;
        activeProducts: number;
        newOrders: number;
        lowStock: number;
    };
}

export function DashboardStats({ stats }: Readonly<DashboardStatsProps>) {
    const defaultStats = {
        totalProducts: 0,
        activeProducts: 0,
        newOrders: 0,
        lowStock: 0,
    };

    const data = stats || defaultStats;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Produtos Ativos"
                value={data.activeProducts}
                icon={<Package className="h-4 w-4" />}
                trend={`${data.totalProducts} produtos no total`}
            />
            <StatsCard
                title="Novos Pedidos"
                value={data.newOrders}
                icon={<ShoppingBag className="h-4 w-4" />}
                trend="Últimos 7 dias"
            />
            <StatsCard
                title="Estoque Baixo"
                value={data.lowStock}
                icon={<AlertCircle className="h-4 w-4" />}
                trend="Requer atenção"
            />
            <StatsCard
                title="Crescimento"
                value="+12%"
                icon={<TrendingUp className="h-4 w-4" />}
                trend="vs. mês anterior"
            />
        </div>
    );
}
