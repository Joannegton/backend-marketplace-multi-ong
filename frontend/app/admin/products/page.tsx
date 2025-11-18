'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Power,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryBadge } from '@/components/atoms/category-badge';
import {
    useDeleteProduct,
    useOrganizationProducts,
    useToggleProductStatus,
} from '@/hooks/products.hook';

export default function AdminProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: products,
        isLoading,
        isError,
        refetch,
    } = useOrganizationProducts();

    const toggleStatusProduct = useToggleProductStatus();
    const deleteProduct = useDeleteProduct();

    const handleToggleStatus = (productId: string) => {
        toggleStatusProduct.mutate({ productId });
    };

    const handleDeleteProduct = (productId: string) => {
        deleteProduct.mutate(productId);
    };

    const filteredProducts = (products ?? [])
        .filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => Number(b.isActive) - Number(a.isActive));

    const renderTableBody = () => {
        if (isLoading) {
            return (
                <TableRow key="loading">
                    <TableCell colSpan={6} className="py-12 text-center">
                        <div className="text-muted-foreground">
                            Carregando produtos...
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        if (isError) {
            return (
                <TableRow key="error">
                    <TableCell colSpan={6} className="py-12 text-center">
                        <div className="mb-4 text-muted-foreground">
                            Erro ao carregar produtos.
                        </div>
                        <Button onClick={() => refetch()}>
                            Tentar novamente
                        </Button>
                    </TableCell>
                </TableRow>
            );
        }

        return filteredProducts.map((product) => (
            <TableRow
                key={product.id}
                className={product.isActive ? '' : 'opacity-60'}
            >
                <TableCell className="w-20 text-center px-1 md:px-3">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted mx-auto">
                        <Image
                            src={product.imageUrl || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </TableCell>
                <TableCell className="font-medium text-left truncate px-2 md:px-4">
                    {product.name}
                </TableCell>
                <TableCell className="hidden md:table-cell text-center px-2 md:px-4">
                    <div className="flex justify-center">
                        <CategoryBadge category={product.category} />
                    </div>
                </TableCell>
                <TableCell className="w-16 md:w-auto text-center px-1 md:px-3">
                    R$ {product.price.toFixed(2)}
                </TableCell>
                <TableCell className="w-16 md:w-auto text-center px-1 md:px-3">
                    {product.stock}
                </TableCell>
                <TableCell className="w-10 md:w-20 text-center px-1 md:px-3 relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(product.id)}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                {product.isActive ? 'Desativar' : 'Ativar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/admin/products/${product.id}/edit`}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-8">
                    <h1 className="text-xl font-semibold">Produtos</h1>
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Produto
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4 md:p-8 flex flex-col">
                <div className="shrink-0 flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos..."
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
                                    <TableHead className="w-20 text-center px-1 md:px-3">
                                        Imagem
                                    </TableHead>
                                    <TableHead className="flex-1 text-left px-2 md:px-4">
                                        Nome
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell text-center px-2 md:px-4">
                                        Categoria
                                    </TableHead>
                                    <TableHead
                                        className="w-16 md:w-auto text-center px-1 md:px-3"
                                        title="Preço"
                                    >
                                        Preço
                                    </TableHead>
                                    <TableHead
                                        className="w-16 md:w-auto text-center truncate px-1 md:px-3"
                                        title="Estoque"
                                    >
                                        Estoque
                                    </TableHead>
                                    <TableHead className="w-10 md:w-20 text-center px-1 md:px-3"></TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <Table
                            className="w-full"
                            style={{ tableLayout: 'fixed' }}
                        >
                            <TableBody>{renderTableBody()}</TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
