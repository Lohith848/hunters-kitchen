import type { CartItem } from "@/store/cart"

export interface Profile {
  id: string
  name: string
  phone: string
  address: string
  college: string
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  items: CartItem[]
  total_amount: number
  delivery_address: string
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  whatsapp_sent: boolean
  created_at: string
  profile?: Profile
}

export interface HotelSettings {
  id: number
  opening_time: string
  closing_time: string
  is_open: boolean
}

export interface Holiday {
  id: string
  date: string
  reason: string | null
  created_at: string
}

export interface Admin {
  id: string
  email: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "id">
        Update: Partial<Omit<Profile, "created_at" | "id">>
      }
      menu_items: {
        Row: MenuItem
        Insert: Omit<MenuItem, "created_at" | "id">
        Update: Partial<Omit<MenuItem, "created_at" | "id">>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, "created_at" | "id" | "profile">
        Update: Partial<Omit<Order, "created_at" | "id" | "profile">>
      }
      hotel_settings: {
        Row: HotelSettings
        Insert: Omit<HotelSettings, "id">
        Update: Partial<Omit<HotelSettings, "id">>
      }
      holidays: {
        Row: Holiday
        Insert: Omit<Holiday, "created_at" | "id">
        Update: Partial<Omit<Holiday, "created_at" | "id">>
      }
      admins: {
        Row: Admin
        Insert: Admin
        Update: Partial<Admin>
      }
    }
  }
}
