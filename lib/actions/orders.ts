"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServer"
import type { Order } from "@/lib/types"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found. Please complete your profile first." }
  }

  // Parse items from JSON
  const itemsJson = formData.get("items") as string
  const total_amount = parseInt(formData.get("total") as string, 10)
  const delivery_address = formData.get("address") as string

  if (!itemsJson || !total_amount || !delivery_address) {
    return { error: "Missing order details" }
  }

  let items
  try {
    items = JSON.parse(itemsJson)
  } catch {
    return { error: "Invalid items format" }
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      items,
      total_amount,
      delivery_address,
      status: "pending",
      whatsapp_sent: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/orders")
  return { success: true, order }
}

export async function getUserOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data } = await supabase
    .from("orders")
    .select("*, profile:profiles(name, phone, college)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("orders")
    .select("*, profile:profiles(name, phone, college)")
    .order("created_at", { ascending: false })

  return data || []
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/orders")
  return { success: true }
}
