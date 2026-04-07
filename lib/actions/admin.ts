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

  return data
}

export async function updateHotelSettings(formData: FormData) {
  const supabase = await createClient()

  const opening_time = formData.get("opening_time") as string
  const closing_time = formData.get("closing_time") as string
  const is_open = formData.get("is_open") === "on"

  const { error } = await supabase
    .from("hotel_settings")
    .upsert({
      id: 1,
      opening_time,
      closing_time,
      is_open,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
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
