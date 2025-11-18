import { ShoppingCart } from '@/lib/types';
import { create } from 'zustand';

export interface ShoppingCartStore {
    shoppingCart: ShoppingCart | null;
    setShoppingCart: (cart: ShoppingCart) => void;
    clearShoppingCart: () => void;
}

export const useShoppingCartStore = create<ShoppingCartStore>((set) => ({
    shoppingCart: {
        id: '',
        items: [],
        total: 0,
        status: 'active',
        expiresAt: '',
        createdAt: '',
    } as ShoppingCart,
    setShoppingCart: (cart: ShoppingCart) => set({ shoppingCart: cart }),
    clearShoppingCart: () => set({ shoppingCart: null }),
}));
