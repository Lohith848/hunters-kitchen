"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [college, setCollege] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

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

    if (data) {
      setFullName(data.full_name || "")
      setPhone(data.phone || "")
      setCollege(data.college || "")
      setAddress(data.address || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Login required")
      return
    }

    setSaving(true)

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      phone,
      college,
      address,
    })

    if (error) {
      console.error(error)
      setError(error.message)
      setSaving(false)
    } else {
      const redirectTo = sessionStorage.getItem("redirectAfterProfile")
      sessionStorage.removeItem("redirectAfterProfile")
      
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        alert("Saved successfully ✅")
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your delivery information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College Name</Label>
              <Input
                id="college"
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Hostel Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={saving}
                rows={3}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
