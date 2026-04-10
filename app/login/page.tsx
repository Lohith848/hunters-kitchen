"use client"

import { useState, useEffect } from "react"
import { signInWithOTP } from "@/lib/actions/auth"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Mail,
  ArrowRight,
  Loader2,
  ChefHat,
  Shield,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showAdmin, setShowAdmin] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("otp")
    setError(null)
    try {
      const result = await signInWithOTP(email)
      if (result?.error) {
        setError(result.error)
        setLoading(null)
      } else {
        setOtpSent(true)
        setLoading(null)
        setResendCooldown(30)
      }
    } catch {
      // redirect happens on success
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return
    setLoading("resend")
    setError(null)
    try {
      const result = await signInWithOTP(email)
      if (result?.error) {
        setError(result.error)
        setLoading(null)
      } else {
        setLoading(null)
        setResendCooldown(30)
      }
    } catch {
      // redirect happens on success
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.")
      return
    }
    setLoading("verify")
    setError(null)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })
    if (error) {
      setError(error.message)
      setLoading(null)
      return
    }
    setTimeout(() => {
      window.location.href = "/"
    }, 500)
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("admin")
    setError(null)

    const allowedAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    
    if (!allowedAdminEmail || adminEmail.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
      setError("You are not authorized to access admin panel.")
      setLoading(null)
      return
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })
    if (error) {
      setError(error.message)
      setLoading(null)
      return
    }

    if (signInData?.user) {
      await supabase.from("admins").upsert({
        id: signInData.user.id,
        email: adminEmail,
      }, { onConflict: 'id' })
    }

    setTimeout(() => {
      window.location.href = "/admin"
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-stone-50 via-white to-stone-100" />
        <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/30 blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-rose-100/40 to-amber-100/30 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-30" />
      </div>

      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 mb-5">
            <ChefHat className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hunters Kitchen
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sign in to order fresh food
          </p>
        </div>

        <div className="card-warm rounded-2xl p-6 sm:p-8">
          {!showAdmin ? (
            !otpSent ? (
              <form onSubmit={handleOTP} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                      required
                      disabled={loading === "otp"}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={loading === "otp"}
                >
                  {loading === "otp" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/30 mb-3">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Check your email
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Code sent to <span className="text-foreground font-medium">{email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-foreground">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="******"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading === "verify" || loading === "otp"}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {loading === "verify" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp("")
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || loading === "resend"}
                    className="flex-1 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "resend" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <button
                type="button"
                onClick={() => setShowAdmin(false)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to user login
              </button>

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/30 mb-3">
                  <Shield className="w-6 h-6 text-accent-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Admin Login
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Restricted access only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-foreground">
                  Admin Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@hunterskitchen.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  required
                  disabled={loading === "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  required
                  disabled={loading === "admin"}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                disabled={loading === "admin"}
              >
                {loading === "admin" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Admin Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {!showAdmin && (
            <div className="mt-6 pt-5 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setShowAdmin(true)
                  setError(null)
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          © {new Date().getFullYear()} Hunters Kitchen
        </p>
      </div>
    </div>
  )
}