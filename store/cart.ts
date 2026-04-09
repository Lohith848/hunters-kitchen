import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  image_url?: string
}

export type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
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
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(0, qty) } : i
          ).filter((i) => i.qty > 0),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.qty, 0)
      },
    }),
    {
      name: "hunters-kitchen-cart",
    }
  )
)
