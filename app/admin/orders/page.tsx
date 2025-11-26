import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminOrdersList } from '@/components/admin-orders-list'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

export const metadata = {
  title: 'Manage Orders | Admin | PizzaShop Suisse',
  description: 'Manage customer orders',
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/orders')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch all orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        order_item_toppings (*)
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PizzaShop Suisse Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-sm font-medium text-primary">
              Orders
            </Link>
            <Link href="/admin/menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Manage Orders</h1>
        <AdminOrdersList orders={orders || []} />
      </main>
    </div>
  )
}
