import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabaseServer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!admin) {
    redirect("/")
  }

  return <>{children}</>
}
