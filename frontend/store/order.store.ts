import { Order } from "@/lib/types";
import { create } from "zustand";

export interface OrderStore {
  order: Order | null;
  setOrder: (order: Order) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: null,
  setOrder: (order: Order) => set({ order }),
  clearOrder: () => set({ order: null }),
}));
