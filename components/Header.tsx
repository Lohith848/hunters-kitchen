"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useCart } from "@/store/cart"
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ChefHat,
  UtensilsCrossed,
  ClipboardList,
  Home,
} from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const cartItems = useCart((state) => state.items)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    checkUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
      setUserName(session?.user?.email?.split("@")[0] || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setIsLoggedIn(!!session)
    setUserName(session?.user?.email?.split("@")[0] || null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName(null)
    window.location.href = "/login"
  }

  const isLoginPage = pathname === "/login"
  const isAdminPage = pathname.startsWith("/admin")

  if (isLoginPage) return null

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl shadow-sm border-b border-border/50"
            : "bg-background border-b border-border/30"
        }`}
      >
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.12_30)] shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block font-[family-name:var(--font-display)]">
              DineFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-10">
            <NavButton
              href="/"
              icon={Home}
              label="Home"
              isActive={pathname === "/"}
            />
            <NavButton
              href="/menu"
              icon={UtensilsCrossed}
              label="Menu"
              isActive={pathname === "/menu"}
              variant="menu"
            />
            <NavButton
              href="/orders"
              icon={ClipboardList}
              label="Orders"
              isActive={pathname === "/orders"}
              variant="orders"
            />
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/cart"
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                pathname === "/cart"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-gradient-to-r from-primary to-[oklch(0.55_0.12_30)] text-white text-xs font-bold shadow-sm shadow-primary/30">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="truncate max-w-[100px]">{userName}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-xl animate-fade-in">
            <nav className="container py-4 space-y-1">
              <MobileNavLink href="/" icon={Home} label="Home" isActive={pathname === "/"} />
              <MobileNavLink href="/menu" icon={UtensilsCrossed} label="Menu" isActive={pathname === "/menu"} />
              <MobileNavLink href="/orders" icon={ClipboardList} label="Orders" isActive={pathname === "/orders"} />
              <MobileNavLink href="/cart" icon={ShoppingBag} label="Cart" isActive={pathname === "/cart"} badge={cartCount} />
              <div className="border-t my-2" />
              {isLoggedIn ? (
                <>
                  <MobileNavLink href="/profile" icon={User} label="Profile" isActive={pathname === "/profile"} />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <MobileNavLink href="/login" icon={User} label="Sign In" isActive={false} />
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function NavButton({
  href,
  icon: Icon,
  label,
  isActive,
  variant = "default",
}: {
  href: string
  icon: any
  label: string
  isActive: boolean
  variant?: "default" | "menu" | "orders" | "admin"
}) {
  const baseStyles =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"

  const variants = {
    default: isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
    menu: isActive
      ? "bg-secondary/20 text-secondary-foreground"
      : "text-muted-foreground hover:text-secondary-foreground hover:bg-secondary/10",
    orders: isActive
      ? "bg-[oklch(0.55_0.12_150_/_10%)] text-[oklch(0.55_0.12_150)]"
      : "text-muted-foreground hover:text-[oklch(0.55_0.12_150)] hover:bg-[oklch(0.55_0.12_150_/_5%)]",
    admin: isActive
      ? "bg-purple-100 text-purple-700"
      : "text-muted-foreground hover:text-purple-600 hover:bg-purple-50",
  }

  return (
    <Link href={href} className={`${baseStyles} ${variants[variant]}`}>
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  badge,
}: {
  href: string
  icon: any
  label: string
  isActive: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        {label}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
          {badge}
        </span>
      )}
    </Link>
  )
}
