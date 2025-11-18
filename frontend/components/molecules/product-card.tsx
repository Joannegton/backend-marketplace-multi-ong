'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/atoms/category-badge';
import { useState } from 'react';
import type { Product } from '@/lib/types';

interface ProductCardProps {
    product: Product;
    onQuickAdd?: (product: Product) => void;
    isLoadingAdd?: boolean;
}

export function ProductCard({
    product,
    onQuickAdd,
    isLoadingAdd,
}: Readonly<ProductCardProps>) {
    const [isHovered, setIsHovered] = useState(false);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickAdd?.(product);
    };

    return (
        <Link href={`/products/${product.id}`}>
            <Card
                className="group overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="aspect-square relative bg-muted overflow-hidden">
                    <Image
                        src={product.imageUrl || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {onQuickAdd && isHovered && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={handleQuickAdd}
                                disabled={isLoadingAdd || product.stock === 0}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {product.stock > 0
                                    ? 'Adicionar'
                                    : 'Sem estoque'}
                            </Button>
                        </div>
                    )}
                </div>
                <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm line-clamp-2 text-balance">
                            {product.name}
                        </h3>
                        <CategoryBadge category={product.category} />
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <p className="text-lg font-bold">
                            R$ {product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {product.weight}g
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
