import { useEffect } from "react";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { cartApi } from "@/api/cart.api";
import { useShoppingCartStore } from "@/store/cart.store";

export const useAppInitialization = () => {
  const { setShoppingCart } = useShoppingCartStore();

  const hasCartCookie = Boolean(Cookies.get("cartId"));
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    enabled: hasCartCookie,
    retry: false,
  });

  useEffect(() => {
    if (cartData) {
      setShoppingCart(cartData);
    }
  }, [cartData, setShoppingCart]);

  return {
    isAuthenticated: false,
  };
};
