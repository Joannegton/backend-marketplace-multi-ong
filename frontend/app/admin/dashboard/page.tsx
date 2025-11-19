"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/atoms/badge";
import { DashboardStats } from "@/components/organisms/dashboard-stats";
import { apiRequest } from "@/lib/api";

type RecentOrder = {
  id: string;
  customer: string;
  total: number;
  status: string;
};

type LowStockProduct = {
  name: string;
  stock: number;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProducts: number;
    activeProducts: number;
    newOrders: number;
    lowStock: number;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiRequest.get("/auth/me");
        if (res.status === 200 && mounted) {
          const dashboard = (res.data as any).dashboard;
          if (dashboard) {
            setStats(dashboard.stats || null);
            setRecentOrders(dashboard.recentOrders || []);
            setLowStockProducts(dashboard.lowStockProducts || []);
          }
        }
      } catch (err) {
        // fail silently and keep mocked/fallback UI
        // console.error('Failed to load dashboard', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <DashboardStats stats={stats ?? undefined} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos pedidos recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Carregando pedidos...</p>
              ) : recentOrders.length ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
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
                          order.status === "completed" ||
                          order.status === "paid"
                            ? "success"
                            : "warning"
                        }
                      >
                        {order.status === "completed" || order.status === "paid"
                          ? "Pago"
                          : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido recente
                </p>
              )}
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
              {loading ? (
                <p>Carregando produtos...</p>
              ) : lowStockProducts.length ? (
                lowStockProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <p className="text-sm font-medium">{product.name}</p>
                    <Badge variant="warning">{product.stock} unidades</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem produtos com estoque baixo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
