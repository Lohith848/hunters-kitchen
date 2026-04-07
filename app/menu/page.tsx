"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useCart } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Plus, Minus } from "lucide-react"
import type { MenuItem } from "@/lib/types"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { items, addItem, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category")
      .order("name")

    setMenuItems(data || [])
    setLoading(false)
  }

  const categories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)))

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems

  const getItemQuantity = (id: string) => {
    const item = items.find((i) => i.id === id)
    return item?.qty || 0
  }

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
    })
  }

  const handleRemoveFromCart = (id: string) => {
    removeItem(id)
  }

  const handleUpdateQuantity = (id: string, delta: number) => {
    const currentQty = getItemQuantity(id)
    const newQty = currentQty + delta

    if (newQty <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQty)
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Our Menu</h1>
        <p className="text-muted-foreground mt-2">
          Fresh food delivered to your hostel
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const qty = getItemQuantity(item.id)
          return (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant="secondary">₹{item.price}</Badge>
                </div>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardFooter className="mt-auto">
                {qty > 0 ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="flex-1 text-center font-medium">
                      {qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No items found in this category.
        </div>
      )}
    </div>
  )
}
