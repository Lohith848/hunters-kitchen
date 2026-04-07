"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProfile } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ProfileSetupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setLoading(true)

    const result = await createProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/menu")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Enter your details so we can deliver your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College Name</Label>
              <Input
                id="college"
                name="college"
                type="text"
                placeholder="XYZ Engineering College"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Hostel Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Hostel 5, Room 123, Floor 1"
                required
                disabled={loading}
                rows={3}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile & Order"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
