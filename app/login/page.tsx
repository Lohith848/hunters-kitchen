"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/actions/auth"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/")
      } else {
        setChecking(false)
      }
    }
    checkSession()
  }, [router])

  if (checking) {
    return null // or a loading spinner
  }


  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setLoading(true)

    const action = isSignUp ? signUp : signIn
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (isSignUp) {
      // For signUp, redirect to profile setup on success
      router.push("/profile/setup")
    }
    // For signIn, the server action redirects automatically on success
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Badge variant="secondary" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Students Only
            </Badge>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Enter your email to create your account"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@student.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
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
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Use your college email for verification.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
