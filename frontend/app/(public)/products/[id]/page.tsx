'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/atoms/category-badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/molecules/product-card';
import { useState, useEffect, useCallback } from 'react';
import { useGetProduct } from '@/hooks/products.hook';
import { useProductStore } from '@/store/products.store';
import { useSmartAddToCart } from '@/hooks/cart.hook';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [quantity, setQuantity] = useState(1);
    const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

    const { data: product, isLoading, error } = useGetProduct(productId);
    const { mutate: smartAddToCart, isPending: isSubmitting } =
        useSmartAddToCart();

    const { products } = useProductStore();

    const relatedProducts = products
        .filter((p) => p.category === product?.category && p.id !== productId)
        .slice(0, 4);

    useEffect(() => {
        if (error) {
            toast.error('Erro ao carregar produto');
            router.push('/');
        }
    }, [error, router]);

    const handleQuickAdd = useCallback(
        (product: Product) => {
            setLoadingProductId(product.id);
            smartAddToCart(
                { ...product, quantity: 1 },
                {
                    onSuccess: () => {
                        setLoadingProductId(null);
                    },
                    onError: () => {
                        setLoadingProductId(null);
                    },
                }
            );
        },
        [smartAddToCart]
    );

    const handleAddToCart = () => {
        if (!product) return;
        smartAddToCart(
            { ...product, quantity },
            {
                onSuccess: () => {
                    setQuantity(1);
                },
                onError: () => {
                    setQuantity(1);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                        Produto não encontrado
                    </p>
                    <Button onClick={() => router.push('/')}>
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container px-4 md:px-8 py-8">
                <Button
                    variant="ghost"
                    className="mb-6 -ml-4"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image
                            src={product.imageUrl || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <CategoryBadge category={product.category} />
                            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2 text-balance">
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">
                                R$ {product.price.toFixed(2)}
                            </span>
                        </div>

                        <p className="text-muted-foreground leading-relaxed text-pretty">
                            {product.description}
                        </p>

                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Peso:
                                    </span>
                                    <span className="font-medium flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        {product.weight}g
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Estoque:
                                    </span>
                                    <span
                                        className={`font-medium ${
                                            product.stock > 0
                                                ? 'text-green-600'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {product.stock > 0
                                            ? `${product.stock} unidades disponíveis`
                                            : 'Fora de estoque'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <span className="text-sm font-medium">
                                    Quantidade:
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1)
                                            )
                                        }
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-medium">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setQuantity(
                                                Math.min(
                                                    product.stock,
                                                    quantity + 1
                                                )
                                            )
                                        }
                                        disabled={quantity >= product.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isSubmitting}
                            >
                                {product.stock > 0
                                    ? 'Adicionar ao Carrinho'
                                    : 'Fora de Estoque'}
                            </Button>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-6">
                            Produtos Relacionados
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    product={relatedProduct}
                                    onQuickAdd={handleQuickAdd}
                                    isLoadingAdd={loadingProductId === relatedProduct.id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
