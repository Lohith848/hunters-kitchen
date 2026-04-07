import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Truck, Wallet, GraduationCap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1 text-sm">
            <GraduationCap className="w-4 h-4 mr-2" />
            Exclusive for College Students
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
            Fresh Food,
            <span className="text-primary bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Free Delivery</span>
            {" "}to Your Hostel
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            The Hunters Kitchen brings delicious meals straight to your college hostel.
            No delivery fees, student-friendly prices, just good food.
          </p>
          <div className="flex gap-4">
            <Link href="/menu">
              <Button size="lg" className="gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Truck className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Free Delivery</CardTitle>
              <CardDescription>
                No delivery charges for college students. Get your food delivered straight to your hostel.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Wallet className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Student Prices</CardTitle>
              <CardDescription>
                Special pricing exclusively for college students. Quality food at affordable rates.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <ShoppingBag className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Easy Ordering</CardTitle>
              <CardDescription>
                Browse menu, add to cart, and order via WhatsApp. Simple and convenient.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Order in 3 simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold text-lg">Browse Menu</h3>
            <p className="text-muted-foreground">
              Explore our delicious menu options designed for students.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold text-lg">Add to Cart</h3>
            <p className="text-muted-foreground">
              Select your favorite dishes and add them to your cart.
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold text-lg">Order via WhatsApp</h3>
            <p className="text-muted-foreground">
              Complete your order and we will prepare it right away.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join hundreds of students who enjoy fresh food delivered free to their hostel.
            </p>
            <Link href="/menu">
              <Button size="lg" variant="secondary" className="gap-2">
                <ShoppingBag className="w-5 h-5" />
                View Full Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
