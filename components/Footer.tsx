import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-2">The Hunters Kitchen</h3>
            <p className="text-sm text-muted-foreground">
              Fresh food delivered free to college students.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/menu" className="hover:text-primary">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Contact</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>WhatsApp: +91 63833 46991</li>
              <li>Available for college students only</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Legal</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/admin/login" className="hover:text-primary">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} The Hunters Kitchen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
