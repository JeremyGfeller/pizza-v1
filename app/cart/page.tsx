import { CartView } from '@/components/cart-view'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

export const metadata = {
  title: 'Cart | PizzaShop Suisse',
  description: 'Review your order and proceed to checkout',
}

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PizzaShop Suisse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
            <Link href="/track" className="text-sm font-medium hover:text-primary transition-colors">
              Track Order
            </Link>
            <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
        <CartView />
      </main>
    </div>
  )
}
