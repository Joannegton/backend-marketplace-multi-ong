import { apiRequest, errorMessages } from '@/lib/api';
import { ShoppingCart } from '@/lib/types';

export interface AddItemToCartDto {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemQuantityDto {
    productId: string;
    quantity: number;
}

export const cartApi = {
    createCart: async (data: AddItemToCartDto): Promise<ShoppingCart> => {
        const response = await apiRequest.post<ShoppingCart>('/cart', {
            body: data,
        });
        if (response.status !== 200 && response.status !== 201) {
            throw new Error(
                errorMessages[response.status] || 'Erro ao criar carrinho'
            );
        }
        return response.data;
    },

    addItemToCart: async (data: AddItemToCartDto): Promise<ShoppingCart> => {
        const response = await apiRequest.post<ShoppingCart>('/cart/items', {
            body: data,
        });
        if (response.status !== 200 && response.status !== 201) {
            throw new Error(
                errorMessages[response.status] ||
                    'Erro ao adicionar item ao carrinho'
            );
        }
        return response.data;
    },

    updateItemQuantity: async (
        data: UpdateCartItemQuantityDto
    ): Promise<ShoppingCart> => {
        const response = await apiRequest.patch<ShoppingCart>('/cart/items', {
            body: data,
        });
        if (response.status !== 200) {
            throw new Error(
                errorMessages[response.status] ||
                    'Erro ao atualizar quantidade do item'
            );
        }
        return response.data;
    },

    removeItemFromCart: async (productId: string): Promise<ShoppingCart> => {
        const response = await apiRequest.delete<ShoppingCart>(
            `/cart/items/${productId}`
        );
        if (response.status !== 200) {
            throw new Error(
                errorMessages[response.status] ||
                    'Erro ao remover item do carrinho'
            );
        }
        return response.data;
    },

    getCart: async (): Promise<ShoppingCart> => {
        const response = await apiRequest.get<ShoppingCart>('/cart');
        if (response.status !== 200) {
            throw new Error(
                errorMessages[response.status] || 'Erro ao buscar carrinho'
            );
        }
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        const response = await apiRequest.delete('/cart');
        if (response.status >= 400) {
            throw new Error('Erro ao limpar carrinho');
        }
    },
};
