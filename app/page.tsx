"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import {
  ShoppingBag,
  Truck,
  Wallet,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
  UtensilsCrossed,
  Heart,
  XCircle,
  AlertTriangle,
} from "lucide-react"

type StoreStatus = {
  is_open: boolean
  reason?: string
}

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({ is_open: true })

  useEffect(() => {
    checkAuth()
    checkStoreStatus()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.replace("/login")
    } else {
      setIsLoggedIn(true)
      setLoading(false)
    }
  }

  const checkStoreStatus = async () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const today = now.toISOString().split("T")[0]

    const { data: settings } = await supabase
      .from("hotel_settings")
      .select("*")
      .eq("id", 1)
      .single()

    const { data: holidays } = await supabase
      .from("holidays")
      .select("*")
      .gte("date", today)
      .lte("date", today)

    if (holidays && holidays.length > 0) {
      setStoreStatus({ is_open: false, reason: `Holiday: ${holidays[0].reason || "Closed today"}` })
      return
    }

    if (!settings?.is_open) {
      setStoreStatus({ is_open: false, reason: "Store is closed" })
      return
    }

    if (settings?.opening_time && settings?.closing_time) {
      if (currentTime < settings.opening_time || currentTime > settings.closing_time) {
        setStoreStatus({ is_open: false, reason: `Opens at ${settings.opening_time}` })
        return
      }
    }

    setStoreStatus({ is_open: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {!storeStatus.is_open && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="container py-3 px-4">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{storeStatus.reason || "Store is currently closed"}</span>
            </div>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] blob-1 bg-gradient-to-br from-primary/8 to-transparent blur-3xl opacity-60" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] blob-2 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl opacity-50" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        <div className="container py-20 md:py-28 lg:py-36">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-card border-2 border-border/60 text-sm font-medium shadow-sm mb-8 hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Student</span>
              <span className="text-primary">Exclusive</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="block">Fresh Food,</span>
              <span className="text-gradient block mt-2">Free Delivery</span>
              <span className="block mt-2">to You </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              <span className="font-medium text-foreground">The DineFlow</span> brings 
              home-style meals straight to you. No hidden fees, ever.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
              {storeStatus.is_open ? (
                <>
                  <Link
                    href="/menu"
                    className="group flex items-center gap-3 h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                    Order Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/menu"
                    className="group flex items-center gap-2 h-14 px-6 rounded-2xl border-2 border-border/60 bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80 transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Browse Menu
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted text-muted-foreground">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Currently Closed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{storeStatus.reason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-8 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <span>1000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-secondary-foreground" />
                </div>
                <span>30 min avg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/10">
        <div className="container py-10">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {[
              { icon: Truck, label: "Free Delivery", color: "text-primary" },
              { icon: Clock, label: "30 Min Delivery", color: "text-secondary-foreground" },
              { icon: Star, label: "4.9 Rating", color: "text-[oklch(0.55_0.12_55)]" },
              { icon: Wallet, label: "Student Prices", color: "text-[oklch(0.45_0.15_30)]" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-card border border-border/40 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-28">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Why Everyone Love Us
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto text-lg">
            Everything you need for a great meal, without the hassle
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {[
            {
              icon: Truck,
              title: "Free Delivery",
              desc: "Zero delivery charges for all orders. We bring the food right to you.",
              color: "from-primary to-[oklch(0.55_0.12_30)]",
              shadow: "shadow-primary/15",
            },
            {
              icon: Wallet,
              title: "Prices",
              desc: "Specially curated pricing that fits a tight budget. Quality food at honest rates.",
              color: "from-secondary to-[oklch(0.60_0.10_145)]",
              shadow: "shadow-secondary/20",
            },
            {
              icon: ShoppingBag,
              title: "Easy Ordering",
              desc: "Browse, pick, and order in minutes. Track your order and enjoy fresh food.",
              color: "from-[oklch(0.88_0.08_55)] to-[oklch(0.45_0.15_30)]",
              shadow: "shadow-[oklch(0.45_0.15_30)]/15",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border-2 border-border/40 hover:border-primary/30 hover-lift"
            >
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full" />
              </div>
              
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.shadow} shadow-lg mb-6`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-[family-name:var(--font-display)]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 border-y border-border/40">
        <div className="container py-20 md:py-24">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto text-lg">
              Three simple steps to a delicious meal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                step: "01",
                title: "Browse Menu",
                desc: "Explore our curated menu of fresh, home-style meals made daily.",
              },
              {
                step: "02",
                title: "Add to Cart",
                desc: "Select your favorites and customize your order to your liking.",
              },
              {
                step: "03",
                title: "Get Delivered",
                desc: "Sit back and relax. We'll deliver hot food to your door.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border via-primary/30 to-border" />
                )}
                
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border-2 border-border/60 shadow-lg mb-6 group-hover:border-primary/40 group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl font-bold text-gradient">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 font-[family-name:var(--font-display)]">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-20 md:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[oklch(0.48_0.14_35)] to-[oklch(0.55_0.12_30)] p-12 md:p-16 text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute inset-0 bg-dots opacity-20" />

          <div className="relative z-10 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-display)]">
              Ready to Order?
            </h2>
            <p className="text-white/80 mb-10 max-w-lg mx-auto text-lg">
              Join hundreds of people who enjoy fresh meals delivered free every day.
            </p>
            {storeStatus.is_open ? (
              <Link
                href="/menu"
                className="group inline-flex items-center gap-3 h-14 px-10 rounded-2xl bg-white text-primary font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <UtensilsCrossed className="w-5 h-5" />
                View Full Menu
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 text-white">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{storeStatus.reason}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
