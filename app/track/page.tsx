'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { OrderTracker } from '@/components/order-tracker'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

export default function TrackOrderPage() {
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
            <Link href="/track" className="text-sm font-medium text-primary">
              Track Order
            </Link>
            <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Enter your order ID or email to see your order status
          </p>
          <OrderTracker />
        </div>
      </main>
    </div>
  )
}
