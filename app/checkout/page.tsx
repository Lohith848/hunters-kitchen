"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useCart } from "@/store/cart"
import { createOrder } from "@/lib/actions/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageCircle } from "lucide-react"
import type { Profile } from "@/lib/types"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [college, setCollege] = useState("")

  const total = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  )

  useEffect(() => {
    if (items.length === 0) {
      router.push("/menu")
      return
    }
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
      .single()

    if (data) {
      setProfile(data)
      setName(data.name)
      setPhone(data.phone)
      setAddress(data.address)
      setCollege(data.college)
    }
  }

  const handleOrder = async () => {
    if (!name || !phone || !address || !college) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    // Create order in database
    const formData = new FormData()
    formData.set("items", JSON.stringify(items))
    formData.set("total", total.toString())
    formData.set("address", address)

    const result = await createOrder(formData)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
      return
    }

    // Build WhatsApp message
    const message = `🍽️ *New Order - The Hunters Kitchen*

👤 Name: ${name}
📞 Phone: ${phone}
🏠 Address: ${address}
🎓 College: ${college}

📋 Order:
${items.map((i) => `${i.qty}x ${i.name} - ₹${i.price * i.qty}`).join("\n")}

💰 Total: ₹${total}
💵 Payment: Cash on Delivery`

    // Open WhatsApp
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "916383346991"
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")

    // Clear cart and redirect
    clearCart()
    router.push("/orders")
  }

  return (
    <div className="container py-12">
      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Delivery Details */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>
              Where should we deliver your order?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College Name</Label>
              <Input
                id="college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="XYZ Engineering College"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Hostel Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Hostel 5, Room 123, Floor 1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.qty}x {item.name}
                  </span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">COD</Badge>
                <span>Cash on Delivery only</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={handleOrder}
                disabled={loading}
              >
                <MessageCircle className="w-5 h-5" />
                {loading ? "Processing..." : "Order via WhatsApp"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
