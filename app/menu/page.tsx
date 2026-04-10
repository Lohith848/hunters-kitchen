"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useCart, type CartItem } from "@/store/cart"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  Search,
} from "lucide-react"

type MenuItemData = {
  id: string
  name: string
  price: number
  category: string
  image_url: string
  is_available: boolean
  description?: string
}

export default function MenuPage() {
  const router = useRouter()
  const [menu, setMenu] = useState<MenuItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const { items, addItem, updateQuantity, getTotalItems } = useCart()
  const [cartCount, setCartCount] = useState(0)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  useEffect(() => {
    fetchMenu()
  }, [])

  useEffect(() => {
    setCartCount(getTotalItems())
  }, [items, getTotalItems])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120
      
      const categories = Object.keys(categoryRefs.current)
      for (let i = categories.length - 1; i >= 0; i--) {
        const category = categories[i]
        const element = categoryRefs.current[category]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(category)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        const firstCategory = allData[0]?.category || "Other"
        setActiveCategory(firstCategory)
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
      updateQuantity(id, item.qty - 1)
    }
  }

  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category]
    if (element) {
      const offset = 100
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
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

  const filteredMenu = searchQuery
    ? Object.fromEntries(
        Object.entries(groupedMenu).map(([cat, items]) => [
          cat,
          items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        ])
      )
    : groupedMenu

  const categories = Object.keys(filteredMenu)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28 md:pb-8">
      <div className="bg-gradient-to-br from-primary to-primary/80 sticky top-0 z-40 shadow-lg">
        <div className="container py-3 px-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {categories.length > 1 && (
          <div className="overflow-x-auto scrollbar-hide border-t border-white/10">
            <div className="flex px-4 py-2 gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category
                      ? "bg-white text-primary"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="container py-6 px-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {menu.length === 0 && (
          <div className="text-center py-16">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No items available</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </div>
        )}

        {Object.entries(filteredMenu).map(([category, categoryItems]) => (
          categoryItems.length > 0 && (
            <div
              key={category}
              ref={(el) => { categoryRefs.current[category] = el }}
              className="mb-8 scroll-mt-32"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">{category}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {categoryItems.length} items
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {categoryItems.map((item) => (
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
          )
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden z-50">
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl p-4 shadow-2xl">
            <Link href="/cart" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-white/70">View cart</p>
                </div>
              </div>
              <div className="bg-white text-primary px-4 py-2 rounded-xl font-bold">
                ₹{cartTotal}
              </div>
            </Link>
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div className="hidden md:block fixed bottom-6 right-6 z-50">
          <Link href="/cart">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground px-6 py-6 rounded-2xl shadow-2xl hover:shadow-lg transition-all hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              <span className="font-bold">View Cart</span>
              <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                {cartCount}
              </span>
              <span className="ml-2 font-bold">₹{cartTotal}</span>
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
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-3">
        <div className="flex flex-col">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.name}</h3>
          <p className="font-bold text-primary text-lg mb-3">₹{item.price}</p>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary/10 rounded-lg px-2 py-1.5">
              <button
                onClick={onDecrease}
                className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold hover:bg-primary/80 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-primary text-base">
                {quantity}
              </span>
              <button
                onClick={onIncrease}
                className="w-8 h-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold hover:bg-primary/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}