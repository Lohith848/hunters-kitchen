"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServer"
import type { HotelSettings, Holiday } from "@/lib/types"

export async function getHotelSettings(): Promise<HotelSettings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("hotel_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (!data) {
    await supabase.from("hotel_settings").insert({
      id: 1,
      is_open: true,
      opening_time: "10:00",
      closing_time: "22:00",
    })
    return {
      id: 1,
      is_open: true,
      opening_time: "10:00",
      closing_time: "22:00",
    }
  }

  return data
}

export async function getStoreStatus(): Promise<{ is_open: boolean; reason?: string }> {
  const supabase = await createClient()
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)
  const today = now.toISOString().split("T")[0]

  const { data: settings } = await supabase
    .from("hotel_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (!settings) {
    return { is_open: true }
  }

  const { data: holidays } = await supabase
    .from("holidays")
    .select("*")
    .gte("date", today)
    .lte("date", today)

  if (holidays && holidays.length > 0) {
    return { is_open: false, reason: `Holiday: ${holidays[0].reason || "Closed today"}` }
  }

  if (!settings.is_open) {
    return { is_open: false, reason: "Store is closed by admin" }
  }

  if (currentTime < settings.opening_time || currentTime > settings.closing_time) {
    return { is_open: false, reason: `Closed (opens ${settings.opening_time})` }
  }

  return { is_open: true }
}

export async function updateHotelSettings(formData: FormData) {
  const supabase = await createClient()

  const opening_time = formData.get("opening_time") as string
  const closing_time = formData.get("closing_time") as string
  const is_open = formData.get("is_open")

  const updateData: Record<string, any> = {}

  if (opening_time) updateData.opening_time = opening_time
  if (closing_time) updateData.closing_time = closing_time
  if (is_open !== null) updateData.is_open = is_open === "true"

  const { error } = await supabase
    .from("hotel_settings")
    .upsert({
      id: 1,
      ...updateData,
    })

  if (error) {
    console.error("Error updating settings:", error)
    return { error: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/settings")
  revalidatePath("/")
  return { success: true }
}

export async function getHolidays(): Promise<Holiday[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("holidays")
    .select("*")
    .order("date", { ascending: true })

  return data || []
}

export async function addHoliday(formData: FormData) {
  const supabase = await createClient()

  const date = formData.get("date") as string
  const reason = formData.get("reason") as string

  if (!date) {
    return { error: "Date is required" }
  }

  const { error } = await supabase.from("holidays").insert({
    date,
    reason: reason || null,
  })

  if (error) {
    console.error("Error adding holiday:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function deleteHoliday(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("holidays")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting holiday:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single()

  return !!data
}