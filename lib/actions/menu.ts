"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabaseServer"
import type { MenuItem } from "@/lib/types"

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category")
    .order("name")

  return data || []
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .order("category")
    .order("name")

  return data || []
}

export async function addMenuItem(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = formData.get("price") as string
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string

  if (!name || !price) {
    return { error: "Name and price are required" }
  }

  const { error } = await supabase.from("menu_items").insert({
    name,
    description: description || null,
    price: parseInt(price, 10),
    category: category || null,
    image_url: image_url || null,
    is_available: true,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/menu")
  revalidatePath("/admin/menu")
  return { success: true }
}

export async function updateMenuItem(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = formData.get("price") as string
  const category = formData.get("category") as string
  const image_url = formData.get("image_url") as string
  const is_available = formData.get("is_available") === "on"

  if (!id || !name || !price) {
    return { error: "ID, name, and price are required" }
  }

  const { error } = await supabase
    .from("menu_items")
    .update({
      name,
      description: description || null,
      price: parseInt(price, 10),
      category: category || null,
      image_url: image_url || null,
      is_available,
    })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/menu")
  revalidatePath("/admin/menu")
  return { success: true }
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/menu")
  revalidatePath("/admin/menu")
  return { success: true }
}

export async function toggleMenuItemAvailability(id: string, is_available: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("menu_items")
    .update({ is_available })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/menu")
  revalidatePath("/admin/menu")
  return { success: true }
}
