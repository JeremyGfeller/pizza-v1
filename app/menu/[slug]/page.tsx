import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PizzaCustomizer } from '@/components/pizza-customizer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pizza, ArrowLeft } from 'lucide-react'
import type { Pizza as PizzaType, PizzaSize, CrustType, Topping } from '@/lib/types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: pizza } = await supabase
    .from('pizzas')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!pizza) {
    return {
      title: 'Pizza Not Found | PizzaShop Suisse',
    }
  }

  return {
    title: `${pizza.name} | PizzaShop Suisse`,
    description: pizza.description,
  }
}

export default async function PizzaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch pizza details
  const { data: pizza } = await supabase
    .from('pizzas')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('is_available', true)
    .single()

  if (!pizza) {
    notFound()
  }

  // Fetch sizes, crust types, and toppings in parallel
  const [
    { data: sizes },
    { data: crustTypes },
    { data: toppings }
  ] = await Promise.all([
    supabase.from('pizza_sizes').select('*').order('display_order'),
    supabase.from('crust_types').select('*').eq('is_available', true),
    supabase.from('toppings').select('*').eq('is_available', true).order('name')
  ])

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
            <Link href="/menu" className="text-sm font-medium text-primary">
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
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/menu">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Link>
        </Button>

        <PizzaCustomizer
          pizza={pizza}
          sizes={sizes || []}
          crustTypes={crustTypes || []}
          toppings={toppings || []}
        />
      </main>
    </div>
  )
}
