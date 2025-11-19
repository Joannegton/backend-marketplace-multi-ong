"use client";

import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/organisms/products-grid";
import { FiltersSidebar } from "@/components/organisms/filters-sidebar";
import { InfiniteScrollTrigger } from "@/components/atoms/infinite-scroll-trigger";
import { useSearchProducts } from "@/hooks/products.hook";
import { useSmartAddToCart } from "@/hooks/cart.hook";
import { useCallback, useState, useRef, useEffect } from "react";
import { SearchProductsParams } from "@/lib/types";
import { useProductStore } from "@/store/products.store";
import type { Product } from "@/lib/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [isSearching, setIsSearching] = useState(!!query);
  const [filters, setFilters] = useState<SearchProductsParams>({ query });
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const search = useSearchProducts(filters, isSearching);
  const { products, isLoadingMore, hasMore } = useProductStore();

  const { mutate: smartAddToCart } = useSmartAddToCart();

  const searchRef = useRef(search);
  const isSearchingRef = useRef(isSearching);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);

  useEffect(() => {
    if (query) {
      setFilters({ query });
      setIsSearching(true);
    }
  }, [query]);

  const handleSearch = useCallback((newFilters: SearchProductsParams) => {
    setFilters(newFilters);
    setIsSearching(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    searchRef.current.loadMore();
  }, []);

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

  return (
    <div className="min-h-screen">
      <main className="px-4 md:px-8 pb-16 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar onSearch={handleSearch} initialQuery={query} />
          <div className="flex-1 space-y-6">
            {query && (
              <h1 className="text-lg font-semibold">
                Mostrando resultados para:{" "}
                <span className="text-primary">"{query}"</span>
              </h1>
            )}
            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  isLoadingMore={isLoadingMore}
                  onQuickAdd={handleQuickAdd}
                  loadingProductId={loadingProductId}
                />
                <InfiniteScrollTrigger
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  isLoading={isLoadingMore}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                  Nenhum produto encontrado
                </h2>
                <p className="text-muted-foreground">
                  Tente buscar por outro termo
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
