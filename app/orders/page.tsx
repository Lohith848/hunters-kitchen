"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { getUserOrders } from "@/lib/actions/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Order } from "@/lib/types"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const userOrders = await getUserOrders()
    setOrders(userOrders)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p>Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>No Orders Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>You haven&apos;t placed any orders yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground mt-2">
          Track your past and current orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} at{" "}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Items:</span>
                  <ul className="mt-1 space-y-1">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-muted-foreground">
                        {item.qty}x {item.name} - ₹{item.price * item.qty}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">₹{order.total_amount}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Delivery to:</span> {order.delivery_address}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
