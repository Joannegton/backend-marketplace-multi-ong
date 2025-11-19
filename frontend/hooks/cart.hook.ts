"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cartApi,
  AddItemToCartDto,
  UpdateCartItemQuantityDto,
} from "@/api/cart.api";
import { useShoppingCartStore } from "@/store/cart.store";
import type { Product } from "@/lib/types";
import Cookies from "js-cookie";

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { setShoppingCart, shoppingCart } = useShoppingCartStore();

  return useMutation({
    mutationFn: async (data: AddItemToCartDto) => {
      const cookieCartId = Cookies.get("cartId");
      if (cookieCartId) {
        return await cartApi.addItemToCart(data);
      }

      if (shoppingCart?.items.length) {
        return await cartApi.addItemToCart(data);
      }

      return await cartApi.createCart(data);
    },
    onSuccess: (cart) => {
      setShoppingCart(cart);
      queryClient.setQueryData(["cart"], cart);
    },
    onError: (error: Error) => {
      throw error;
    },
  });
};

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();
  const { setShoppingCart } = useShoppingCartStore();

  return useMutation({
    mutationFn: async (data: UpdateCartItemQuantityDto) => {
      return await cartApi.updateItemQuantity(data);
    },
    onSuccess: (cart) => {
      setShoppingCart(cart);
      queryClient.setQueryData(["cart"], cart);
    },
    onError: (error: Error) => {
      throw error;
    },
  });
};

export const useSmartAddToCart = () => {
  const { mutate: addToCart } = useAddToCart();
  const { mutate: updateQuantity } = useUpdateCartItemQuantity();
  const { shoppingCart, setShoppingCart } = useShoppingCartStore();

  return useMutation({
    mutationFn: async (product: Product & { quantity: number }) => {
      const existingItem = shoppingCart?.items.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + product.quantity;
        return new Promise<void>((resolve, reject) => {
          updateQuantity(
            { productId: product.id, quantity: newQuantity },
            {
              onSuccess: (cart) => {
                setShoppingCart(cart);
                resolve();
              },
              onError: reject,
            }
          );
        });
      } else {
        return new Promise<void>((resolve, reject) => {
          addToCart(
            { productId: product.id, quantity: product.quantity },
            {
              onSuccess: (cart) => {
                setShoppingCart(cart);
                resolve();
              },
              onError: reject,
            }
          );
        });
      }
    },
    onSuccess: (_, variables) => {
      const existingItem = shoppingCart?.items.find(
        (item) => item.productId === variables.id
      );
      if (existingItem) {
        toast.success(`Quantidade de ${variables.name} atualizada!`);
      } else {
        toast.success(`${variables.name} adicionado ao carrinho!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCart = () => {
  const { setShoppingCart } = useShoppingCartStore();

  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    retry: false,
  });

  if (cart) {
    setShoppingCart(cart);
  }

  return { cart, isLoading, error };
};

export const useRemoveItemFromCart = () => {
  const queryClient = useQueryClient();
  const { setShoppingCart } = useShoppingCartStore();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      return await cartApi.removeItemFromCart(cartItemId);
    },
    onSuccess: (cart) => {
      setShoppingCart(cart);
      queryClient.setQueryData(["cart"], cart);
      toast.success("Item removido do carrinho!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao remover item do carrinho");
      throw error;
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { clearShoppingCart } = useShoppingCartStore();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      clearShoppingCart();
      queryClient.setQueryData(["cart"], null);
      Cookies.remove("cartId");
    },
    onError: (error: Error) => {
      clearShoppingCart();
      queryClient.setQueryData(["cart"], null);
      Cookies.remove("cartId");
    },
  });
};
