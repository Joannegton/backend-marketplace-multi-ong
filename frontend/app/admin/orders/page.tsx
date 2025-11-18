'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/atoms/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useOrganizationOrders } from '@/hooks/order.hook';

export default function AdminOrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: orders = [] } = useOrganizationOrders();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.cliente.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.cliente.email
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.cliente.cpf
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <h1 className="text-xl font-semibold">Pedidos</h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4 md:p-8 flex flex-col">
                <div className="shrink-0 flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar pedidos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="bg-muted border-b">
                        <Table
                            className="w-full"
                            style={{ tableLayout: 'fixed' }}
                        >
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20 text-center px-1 md:px-2">
                                        Pedido
                                    </TableHead>
                                    <TableHead className="w-24 text-left px-1 md:px-2">
                                        Cliente
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell w-28 text-center px-2 md:px-4">
                                        CPF
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell w-32 text-left px-2 md:px-4">
                                        Email
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell w-28 text-center px-2 md:px-4">
                                        Data
                                    </TableHead>
                                    <TableHead className="w-20 text-center px-1 md:px-2">
                                        Total
                                    </TableHead>
                                    <TableHead className="w-20 text-center px-1 md:px-2">
                                        Status
                                    </TableHead>
                                    <TableHead className="w-12 text-center px-1 md:px-2"></TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <Table
                            className="w-full"
                            style={{ tableLayout: 'fixed' }}
                        >
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.orderNumber}>
                                        <TableCell className="w-20 text-center px-1 md:px-2 font-mono font-medium text-sm">
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell className="w-24 text-left px-1 md:px-2">
                                            <div>
                                                <p className="font-medium truncate text-sm">
                                                    {order.cliente.name}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell w-28 text-center px-2 md:px-4 font-mono text-sm">
                                            {order.cliente.cpf}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell w-32 text-left px-2 md:px-4 text-sm text-muted-foreground truncate">
                                            {order.cliente.email}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell w-28 text-center px-2 md:px-4 text-sm text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                        <TableCell className="w-20 text-center px-1 md:px-2 font-semibold text-sm">
                                            R$ {order.total.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="w-20 text-center px-1 md:px-2">
                                            <StatusBadge
                                                status={order.status}
                                            />
                                        </TableCell>
                                        <TableCell className="w-12 text-center px-1 md:px-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                asChild
                                            >
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
