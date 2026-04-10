"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { useCart, type CartItem } from "@/store/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

type ProfileData = {
  id: string
  full_name: string
  phone: string
  address: string
  college: string
} | null

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const total = items.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.qty,
    0
  )

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    setProfile(data)
    setProfileLoading(false)
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (!data || !data.full_name || !data.phone || !data.address || !data.college) {
      const confirm = window.confirm(
        "Please complete your profile before placing an order. Would you like to set up your profile now?"
      )
      if (confirm) {
        sessionStorage.setItem("redirectAfterProfile", "/cart")
        router.push("/profile")
        return
      }
      return
    }

    setProfile(data)

    setLoading(true)

    const orderDetails = items
      .map((item) => `${item.name} × ${item.qty} = ₹${item.price * item.qty}`)
      .join("\n")

    const message = `New Order:

Name: ${data.full_name}
Phone: ${data.phone}
College: ${data.college}
Address: ${data.address}

Order:
${orderDetails}

Total: ₹${total}`

    const whatsappNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "916383346991"
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    clearCart()
    window.open(url, "_blank")
    setLoading(false)
    setOrderSuccess(true)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
          <div className="container">
            <h1 className="text-4xl font-bold text-white">Your Cart</h1>
            <p className="text-slate-400 mt-2">Review your order before checkout</p>
          </div>
        </div>

        <div className="container py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Add items from the menu to get started</p>
            </CardContent>
            <CardContent className="pt-0">
              <Button
                onClick={() => router.push("/menu")}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl"
              >
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 py-16">
        <div className="container">
          <h1 className="text-4xl font-bold text-white">Your Cart</h1>
          <p className="text-slate-400 mt-2">
            {items.length} item{items.length !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: CartItem) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4 gap-4">
                    {item.image_url && (
                      <div className="relative w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {!item.image_url && (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={item.qty <= 1}
                        onClick={() => {
                          if (item.qty <= 1) {
                            removeItem(item.id)
                          } else {
                            updateQuantity(item.id, item.qty - 1)
                          }
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-lg">
                        {item.qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                  >
                    FREE
                  </Badge>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-lg text-orange-600">₹{total}</span>
                </div>
              </CardContent>

              {!profileLoading && !profile && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Complete your profile for faster ordering</span>
                  </div>
                </CardContent>
              )}

              <CardContent className="pt-0">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-12"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Order Placed!
              </DialogTitle>
              <DialogDescription>
                Your order has been sent via WhatsApp. We will confirm it shortly.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => {
                  setOrderSuccess(false)
                  router.push("/menu")
                }}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}