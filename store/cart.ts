import { create } from "zustand"

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image_url?: string
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

export const useCart = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }

      return {
        items: [...state.items, { ...item, qty: 1 }],
      }
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  updateQuantity: (id, qty) =>
    set((state) => {
      if (qty <= 0) {
        return {
          items: state.items.filter((i) => i.id !== id),
        }
      }

      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty } : i
        ),
      }
    }),

  getTotalItems: () =>
    get().items.reduce((sum, i) => sum + i.qty, 0),

  clearCart: () => set({ items: [] }),
}))
