import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminMenuManager } from '@/components/admin-menu-manager'
import Link from 'next/link'
import { Pizza } from 'lucide-react'

export const metadata = {
  title: 'Manage Menu | Admin | PizzaShop Suisse',
  description: 'Manage menu items',
}

export default async function AdminMenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/menu')
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

  // Fetch pizzas and categories
  const { data: pizzas } = await supabase
    .from('pizzas')
    .select('*, categories(name, slug)')
    .order('name')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

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
            <Link href="/admin/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
            <Link href="/admin/menu" className="text-sm font-medium text-primary">
              Menu
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Manage Menu</h1>
        <AdminMenuManager pizzas={pizzas || []} categories={categories || []} />
      </main>
    </div>
  )
}
