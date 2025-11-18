'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useUpdateCartItemQuantity,
    useRemoveItemFromCart,
    useClearCart,
} from '@/hooks/cart.hook';
import { toast } from 'sonner';
import { useShoppingCartStore } from '@/store/cart.store';
import { useGetProductsIds } from '@/hooks/products.hook';

export default function CartPage() {
    const router = useRouter();
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);

    const { shoppingCart } = useShoppingCartStore();
    const {
        data: products,
        isLoading,
        isError,
    } = useGetProductsIds(
        shoppingCart?.items.map((item) => item.productId) || []
    );

    const { mutate: updateQuantity } = useUpdateCartItemQuantity();
    const { mutate: removeItem } = useRemoveItemFromCart();
    const { mutate: clearCart, isPending: isClearingCart } = useClearCart();

    const subtotal =
        shoppingCart?.items.reduce(
            (sum, item) => sum + item.priceSnapshot * item.quantity,
            0
        ) || 0;

    const shipping = subtotal > 0 ? 10 : 0;
    const total = subtotal + shipping;

    const isEmpty = !shoppingCart?.items || shoppingCart.items.length === 0;

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemoveItem(productId);
            return;
        }

        setUpdatingItemId(productId);
        updateQuantity(
            { productId, quantity: newQuantity },
            {
                onSettled: () => {
                    setUpdatingItemId(null);
                },
                onError: (error: Error) => {
                    toast.error(error.message);
                },
            }
        );
    };

    const handleRemoveItem = (productId: string) => {
        setRemovingItemId(productId);
        removeItem(productId, {
            onSettled: () => {
                setRemovingItemId(null);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (isError || !products) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                        Erro ao carregar produtos do carrinho
                    </p>
                    <Button onClick={() => router.push('/')}>
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background overflow-hidden">
            <div className="container mx-auto h-full px-4 md:px-8 py-6 flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <Button
                        variant="ghost"
                        className="-ml-4 hover:bg-muted"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                        Carrinho de Compras
                    </h1>
                    <div className="w-24"></div>
                </div>

                {isEmpty ? (
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <div className="text-center py-16 px-4">
                            <div className="bg-muted/50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">
                                Seu carrinho está vazio
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base">
                                Adicione alguns produtos incríveis de nossas
                                ONGs parceiras e comece sua jornada de compras
                                solidárias!
                            </p>
                            <Button
                                size="lg"
                                onClick={() => router.push('/')}
                                className="px-10 h-12 text-base font-semibold"
                            >
                                Explorar Produtos
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex gap-6 overflow-hidden">
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-5 pb-3 border-b">
                                <h2 className="text-xl font-bold">
                                    Itens no Carrinho{' '}
                                    <span className="ml-2 text-base font-normal text-muted-foreground">
                                        ({shoppingCart?.items.length}{' '}
                                        {shoppingCart?.items.length === 1
                                            ? 'item'
                                            : 'itens'}
                                        )
                                    </span>
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    onClick={() => clearCart()}
                                    disabled={isClearingCart}
                                    type="button"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Limpar Carrinho
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="space-y-3 pr-2">
                                    {shoppingCart?.items.map((item) => {
                                        const product = products.find(
                                            (p) => p.id === item.productId
                                        );
                                        if (!product) return null;

                                        const itemProductId = item.productId;
                                        const itemQuantity = item.quantity;

                                        return (
                                            <Card
                                                key={itemProductId}
                                                className="hover:shadow-md transition-shadow"
                                            >
                                                <CardContent className="p-5">
                                                    <div className="flex gap-5">
                                                        <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                                                            <Image
                                                                src={
                                                                    product.imageUrl ||
                                                                    '/placeholder.svg'
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 space-y-2 min-w-0">
                                                            <h3 className="font-bold text-lg line-clamp-2">
                                                                {
                                                                    item.productName
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground font-medium">
                                                                {
                                                                    product.category
                                                                }
                                                            </p>
                                                            <p className="text-base font-semibold text-foreground">
                                                                R${' '}
                                                                {item.priceSnapshot.toFixed(
                                                                    2
                                                                )}{' '}
                                                                <span className="text-xs text-muted-foreground font-normal">
                                                                    por unidade
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end justify-between gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleRemoveItem(
                                                                        itemProductId
                                                                    );
                                                                }}
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors -mr-2"
                                                                disabled={
                                                                    removingItemId ===
                                                                    itemProductId
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>

                                                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border/50">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleUpdateQuantity(
                                                                            itemProductId,
                                                                            itemQuantity -
                                                                                1
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        updatingItemId ===
                                                                        itemProductId
                                                                    }
                                                                    className="h-8 w-8 p-0 hover:bg-background transition-colors"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-10 text-center font-semibold text-sm tabular-nums">
                                                                    {
                                                                        itemQuantity
                                                                    }
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleUpdateQuantity(
                                                                            itemProductId,
                                                                            itemQuantity +
                                                                                1
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        updatingItemId ===
                                                                        itemProductId
                                                                    }
                                                                    className="h-8 w-8 p-0 hover:bg-background transition-colors"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            <p className="font-bold text-right text-lg text-primary">
                                                                R${' '}
                                                                {(
                                                                    item.priceSnapshot *
                                                                    itemQuantity
                                                                ).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="w-80 shrink-0">
                            <Card className="sticky top-4 shadow-lg">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">
                                        Resumo do Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-3 pb-4 border-b">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal (
                                                {shoppingCart?.items.length}{' '}
                                                {shoppingCart?.items.length ===
                                                1
                                                    ? 'item'
                                                    : 'itens'}
                                                )
                                            </span>
                                            <span className="font-semibold">
                                                R$ {subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Frete
                                            </span>
                                            <span className="font-semibold">
                                                {shipping > 0
                                                    ? `R$ ${shipping.toFixed(2)}`
                                                    : 'Grátis'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center font-bold text-xl py-2">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            R$ {total.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Button
                                            size="lg"
                                            className="w-full h-12 text-base font-semibold"
                                            onClick={() =>
                                                router.push('/customer-data')
                                            }
                                        >
                                            Finalizar Compra
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full h-10"
                                            onClick={() => router.push('/')}
                                        >
                                            Continuar Comprando
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
