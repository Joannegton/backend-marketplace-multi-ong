"use client";

import { FiltersSidebar } from "@/components/organisms/filters-sidebar";
import { ProductGrid } from "@/components/organisms/products-grid";
import { Button } from "@/components/ui/button";
import { InfiniteScrollTrigger } from "@/components/atoms/infinite-scroll-trigger";
import { useCatalog, useSearchProducts } from "@/hooks/products.hook";
import { useSmartAddToCart } from "@/hooks/cart.hook";
import { useCallback, useState, useRef, useEffect } from "react";
import { SearchProductsParams, PRODUCT_CATEGORIES } from "@/lib/types";
import { useProductStore } from "@/store/products.store";
import type { Product } from "@/lib/types";

export default function Home() {
  const [filters, setFilters] = useState<SearchProductsParams>({});
  const [isSearching, setIsSearching] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const catalog = useCatalog();
  const search = useSearchProducts(filters, isSearching);
  const { products, isLoadingMore, hasMore, setCategories } = useProductStore();

  const { mutate: smartAddToCart } = useSmartAddToCart();

  const catalogRef = useRef(catalog);
  const searchRef = useRef(search);
  const isSearchingRef = useRef(isSearching);

  useEffect(() => {
    setCategories([...PRODUCT_CATEGORIES]);
  }, []);

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);

  const handleSearch = useCallback((newFilters: SearchProductsParams) => {
    setFilters(newFilters);
    setIsSearching(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isSearchingRef.current) {
      searchRef.current.loadMore();
    } else {
      catalogRef.current.loadMore();
    }
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
      <section className="bg-linear-to-br from-primary/5 via-primary/10 to-secondary/5 py-10 md:py-10">
        <div className="px-4 md:px-8 max-w-4xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Marketplace <span className="text-primary">Solidário</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Conectando você com produtos incríveis de ONGs parceiras em todo o
              Brasil. Cada compra faz a diferença!
            </p>
          </div>
        </div>
      </section>

      <main className="px-4 md:px-8 pb-16 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar onSearch={handleSearch} />
          <div className="flex-1">
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
          </div>
        </div>
      </main>

      <section className="py-8 bg-primary text-primary-foreground">
        <div className="px-4 md:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Faça Parte Desta Missão
          </h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Cada compra no nosso marketplace ajuda ONGs a continuarem seu
            trabalho transformador. Junte-se a nós nessa jornada de
            solidariedade!
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Começar Agora
          </Button>
        </div>
      </section>
    </div>
  );
}
