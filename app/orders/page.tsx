import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MyOrders } from '@/components/my-orders'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

export const metadata = {
  title: 'My Orders | PizzaShop Suisse',
  description: 'View your order history',
}

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/orders')
  }

  // Fetch user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        order_item_toppings (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
            <Link href="/orders" className="text-sm font-medium text-primary">
              My Orders
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-lg text-muted-foreground mb-8">
            View your order history and track current orders
          </p>
          <MyOrders orders={orders || []} />
        </div>
      </main>
    </div>
  )
}
