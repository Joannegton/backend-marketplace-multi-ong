'use client';

import { useEffect } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/api/products.api';
import { useProductStore } from '@/store/products.store';
import type { SearchProductsParams } from '@/lib/types';

const CINCO_MINUTOS = 5 * 60 * 1000;
const DEZ_MINUTOS = 10 * 60 * 1000;
const VINTE_MINUTOS = 20 * 60 * 1000;

export const useOrganizationProducts = () => {
    return useQuery({
        queryKey: ['products', 'organization'],
        queryFn: () => productsApi.findOrganizationProducts(),
        staleTime: CINCO_MINUTOS,
        gcTime: DEZ_MINUTOS,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.createProduct,
        onSuccess: (newProduct) => {
            queryClient.invalidateQueries({
                queryKey: ['products', 'organization'],
            });
            queryClient.invalidateQueries({
                queryKey: ['products', 'organization', newProduct.id],
            });
            toast.success('Produto criado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useGetProduct = (productId: string) => {
    return useQuery({
        queryKey: ['products', 'detail', productId],
        queryFn: () => productsApi.getProduct(productId),
        enabled: !!productId,
        staleTime: DEZ_MINUTOS,
        gcTime: VINTE_MINUTOS,
    });
};

export const useGetProductsIds = (productIds: string[]) => {
    return useQuery({
        queryKey: ['products', 'detail', productIds],
        queryFn: () => productsApi.getProductsIds(productIds),
        enabled: Array.isArray(productIds) && productIds.length > 0,
        staleTime: DEZ_MINUTOS,
        gcTime: VINTE_MINUTOS,
    });
};

export const useGetOrganizationProduct = (productId: string) => {
    return useQuery({
        queryKey: ['products', 'organization', productId],
        queryFn: () => productsApi.getOrganizationProduct(productId),
        enabled: !!productId,
        staleTime: CINCO_MINUTOS,
        gcTime: DEZ_MINUTOS,
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.updateProduct,
        onSuccess: (updatedProduct) => {
            queryClient.setQueryData(
                ['products', 'detail', updatedProduct.id],
                updatedProduct
            );
            queryClient.setQueryData(
                ['products', 'organization', updatedProduct.id],
                updatedProduct
            );
            queryClient.invalidateQueries({
                queryKey: ['products', 'organization'],
            });

            toast.success('Produto atualizado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`);
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.deleteProduct,
        onSuccess: (_, deletedProductId) => {
            queryClient.removeQueries({
                queryKey: ['products', 'detail', deletedProductId],
                exact: true,
            });
            queryClient.removeQueries({
                queryKey: ['products', 'organization', deletedProductId],
                exact: true,
            });
            queryClient.invalidateQueries({
                queryKey: ['products', 'organization'],
            });

            toast.success('Produto removido com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(`Erro ao remover produto: ${error.message}`);
        },
    });
};

export const useToggleProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId }: { productId: string }) =>
            productsApi.toggleProductStatus({ productId }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['products', 'organization'],
            });
            toast.success('Status do produto atualizado com sucesso!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useCatalog = () => {
    const store = useProductStore();
    const LIMIT = 12;

    const { data, isLoading, fetchNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ['products', 'catalog'],
            queryFn: ({ pageParam = 0 }) =>
                productsApi.getCatalogProducts(LIMIT, pageParam),
            getNextPageParam: (lastPage) => {
                return lastPage.pagination.hasMore
                    ? lastPage.pagination.offset + LIMIT
                    : undefined;
            },
            initialPageParam: 0,
            staleTime: CINCO_MINUTOS,
            gcTime: DEZ_MINUTOS,
        });

    useEffect(() => {
        if (data) {
            const allProducts = data.pages.flatMap((page) => page.results);
            store.setProducts(allProducts);
            store.setHasMore(data.pages.at(-1)?.pagination.hasMore ?? false);
            store.setCurrentOffset(data.pages.at(-1)?.pagination.offset ?? 0);
            store.setLoading(false);
            store.setLoadingMore(isFetchingNextPage);
        } else if (isLoading) {
            store.setLoading(true);
        }
    }, [data, isLoading, isFetchingNextPage]);

    return {
        loadMore: () => fetchNextPage(),
    };
};

export const useSearchProducts = (
    props: SearchProductsParams,
    enabled: boolean
) => {
    const store = useProductStore();
    const LIMIT = 12;

    const { data, isLoading, fetchNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ['products', 'search', props],
            queryFn: ({ pageParam = 0 }) =>
                productsApi.search({
                    ...props,
                    limit: LIMIT,
                    offset: pageParam,
                }),
            getNextPageParam: (lastPage) => {
                return lastPage.pagination.hasMore
                    ? lastPage.pagination.offset + LIMIT
                    : undefined;
            },
            initialPageParam: 0,
            enabled,
            staleTime: CINCO_MINUTOS,
            gcTime: DEZ_MINUTOS,
        });

    useEffect(() => {
        if (data && enabled) {
            const allProducts = data.pages.flatMap((page) => page.results);
            store.setProducts(allProducts);
            store.setHasMore(data.pages.at(-1)?.pagination.hasMore ?? false);
            store.setCurrentOffset(data.pages.at(-1)?.pagination.offset ?? 0);
            store.setLoading(false);
            store.setLoadingMore(isFetchingNextPage);
        } else if (isLoading && enabled) {
            store.setLoading(true);
        }
    }, [data, isLoading, isFetchingNextPage, enabled]);

    return {
        loadMore: () => fetchNextPage(),
    };
};
