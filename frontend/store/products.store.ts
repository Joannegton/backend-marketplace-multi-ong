import { Product } from '@/lib/types';
import { create } from 'zustand';

interface ProductStoreState {
    products: Product[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    currentOffset: number;
    selectedProductId: string | null;
    categories: string[];

    setProducts: (products: Product[]) => void;
    setLoading: (loading: boolean) => void;
    setLoadingMore: (loading: boolean) => void;
    setHasMore: (hasMore: boolean) => void;
    setCurrentOffset: (offset: number) => void;
    setCategories: (categories: string[]) => void;
    setSelectedProduct: (id: string | null) => void;
    resetProducts: () => void;
    addProducts: (newProducts: Product[]) => void;
}

export const useProductStore = create<ProductStoreState>((set, get) => ({
    products: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    currentOffset: 0,
    selectedProductId: null,
    categories: [],

    setProducts: (products: Product[]) => set({ products }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setLoadingMore: (loading: boolean) => set({ isLoadingMore: loading }),
    setHasMore: (hasMore: boolean) => set({ hasMore }),
    setCurrentOffset: (offset: number) => set({ currentOffset: offset }),
    setCategories: (categories: string[]) => set({ categories }),
    setSelectedProduct: (id: string | null) => set({ selectedProductId: id }),
    resetProducts: () =>
        set({
            products: [],
            isLoading: false,
            isLoadingMore: false,
            hasMore: true,
            currentOffset: 0,
        }),

    addProducts: (newProducts: Product[]) =>
        set((state) => ({ products: [...state.products, ...newProducts] })),
}));
