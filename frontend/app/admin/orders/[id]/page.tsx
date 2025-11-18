'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/atoms/status-badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useOrderByIdAndOrganization } from '@/hooks/order.hook';

export default function OrderDetailPage({
    params,
}: Readonly<{
    params: Promise<{ id: string }>;
}>) {
    const { id } = use(params);
    const router = useRouter();
    const { data: order, isLoading, isError } = useOrderByIdAndOrganization(id);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex h-16 items-center justify-between px-4 md:px-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-4 mr-4"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">
                            Detalhes do Pedido
                        </h1>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-muted-foreground">
                            Carregando pedido...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col h-full">
                <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="flex h-16 items-center justify-between px-4 md:px-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-4 mr-4"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">
                            Detalhes do Pedido
                        </h1>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-muted-foreground">
                            Erro ao carregar pedido.
                        </div>
                        <Button onClick={() => router.back()}>Voltar</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-4 mr-4"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-semibold">
                        Detalhes do Pedido
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold font-mono">
                                #{order.orderNumber}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Realizado em {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <StatusBadge status={order.status} />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Nome
                                    </p>
                                    <p className="font-medium">
                                        {order.cliente.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">CPF</p>
                                    <p className="font-medium font-mono">
                                        {order.cliente.cpf}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="font-medium">
                                        {order.cliente.email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Endereço
                                    </p>
                                    <p className="font-medium">
                                        {order.cliente.address},{' '}
                                        {order.cliente.number}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        CEP: {order.cliente.cep}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Itens
                                    </span>
                                    <span className="font-medium">
                                        {order.items.length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Última atualização
                                    </span>
                                    <span className="font-medium text-xs">
                                        {formatDate(order.updatedAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">
                                        R$ {order.total.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Itens do Pedido</CardTitle>
                            <CardDescription>
                                Produtos incluídos neste pedido
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex justify-between items-center py-3 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.productName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                R${' '}
                                                {item.priceSnapshot.toFixed(2)}{' '}
                                                × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            R$ {item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
