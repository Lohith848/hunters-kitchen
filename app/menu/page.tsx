"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useCart, type CartItem } from "@/store/cart"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react"

type MenuItemData = {
  id: string
  name: string
  price: number
  category: string
  image_url: string
  is_available: boolean
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items, addItem, updateQuantity, getTotalItems } = useCart()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchMenu()
  }, [])

  useEffect(() => {
    setCartCount(getTotalItems())
  }, [items, getTotalItems])

  const fetchMenu = async () => {
    try {
      const { data: allData, error: allError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true })

      if (allError) {
        setError(allError.message)
      } else if (allData && allData.length > 0) {
        setMenu(allData)
      }
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  const getItemQty = (id: string): number => {
    const item = items.find((i) => i.id === id)
    return item?.qty || 0
  }

  const handleAdd = (menuItem: MenuItemData) => {
    const cartItem: Omit<CartItem, "qty"> = {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image_url: menuItem.image_url,
    }
    addItem(cartItem)
  }

  const handleIncrease = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      updateQuantity(id, item.qty + 1)
    }
  }

  const handleDecrease = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      if (item.qty <= 1) {
        useCart.getState().removeItem(id)
      } else {
        updateQuantity(id, item.qty - 1)
      }
    }
  }

  const groupedMenu = menu.reduce((acc, item) => {
    const category = item.category || "Other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, MenuItemData[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-8">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Our Menu</h1>
          <p className="text-slate-400 mt-2">Delicious meals crafted with love</p>
        </div>
      </div>

      <div className="container py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {menu.length === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No items available</p>
          </div>
        )}

        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  quantity={getItemQty(item.id)}
                  onAdd={() => handleAdd(item)}
                  onIncrease={() => handleIncrease(item.id)}
                  onDecrease={() => handleDecrease(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
          <Link href="/cart">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold h-14 rounded-xl shadow-lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {cartCount} item{cartCount !== 1 ? "s" : ""} - ₹
              {items.reduce((sum, i) => sum + i.price * i.qty, 0)}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm">View Cart</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function MenuCard({
  item,
  quantity,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  item: MenuItemData
  quantity: number
  onAdd: () => void
  onIncrease: () => void
  onDecrease: () => void
}) {
  const hasImage = item.image_url && item.image_url.length > 0

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {hasImage && (
        <div className="relative h-36 w-full bg-gray-100">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      )}
      <CardContent className="p-3">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.name}</h3>
            <p className="font-bold text-orange-600">₹{item.price}</p>
          </div>

          <div className="mt-3">
            {quantity === 0 ? (
              <Button
                onClick={onAdd}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg h-9 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            ) : (
              <div className="flex items-center justify-between bg-orange-50 rounded-lg p-1">
                <Button
                  onClick={onDecrease}
                  variant="ghost"
                  className="h-8 w-8 rounded-md text-orange-600 hover:bg-orange-100 hover:text-orange-700 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-orange-700 text-sm min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  onClick={onIncrease}
                  variant="ghost"
                  className="h-8 w-8 rounded-md text-orange-600 hover:bg-orange-100 hover:text-orange-700 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}