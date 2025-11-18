import { ProductCard } from '@/components/molecules/product-card';
import type { Product } from '@/lib/types';

interface ProductGridProps {
    products: Product[];
    isLoadingMore?: boolean;
    onQuickAdd?: (product: Product) => void;
    loadingProductId?: string | null;
}

export function ProductGrid({
    products,
    isLoadingMore,
    onQuickAdd,
    loadingProductId,
}: Readonly<ProductGridProps>) {
    if (products.length === 0 && !isLoadingMore) {
        return (
            <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                    Nenhum produto encontrado.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onQuickAdd={onQuickAdd}
                        isLoadingAdd={loadingProductId === product.id}
                    />
                ))}
            </div>

            {isLoadingMore && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}
        </div>
    );
}
