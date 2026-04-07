import { create } from "zustand"

type CartItem = {
    id: string
    name: string
    price: number
    qty: number
}

type CartStore = {
    items: CartItem[]
    addItem: (item: any) => void
}

export const useCart = create<CartStore>((set) => ({
    items: [],

    addItem: (item) =>
        set((state) => {
            const exists = state.items.find(i => i.id === item.id)

            if (exists) {
                return {
                    items: state.items.map(i =>
                        i.id === item.id
                            ? { ...i, qty: i.qty + 1 }
                            : i
                    ),
                }
            }

            return {
                items: [...state.items, { ...item, qty: 1 }],
            }
        }),
}))