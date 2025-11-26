import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Pizza, Clock, Truck } from 'lucide-react'
import { PostalCodeChecker } from '@/components/postal-code-checker'

export default function HomePage() {
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
            <Button asChild>
              <Link href="/menu">Order Now</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Authentic Swiss Pizza Delivered to Your Door
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              Fresh ingredients, traditional recipes, and a touch of Swiss quality. 
              Order now and enjoy the best pizza in Switzerland.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <PostalCodeChecker />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" asChild>
                <Link href="/menu">
                  Browse Full Menu <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/track">Track Your Order</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pizza className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-muted-foreground">
                We use only the freshest, locally-sourced ingredients for authentic taste
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Hot and fresh pizzas delivered in 30 minutes or less
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Order</h3>
              <p className="text-muted-foreground">
                Real-time updates from kitchen to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our menu and customize your perfect pizza
          </p>
          <Button size="lg" asChild>
            <Link href="/menu">View Full Menu</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 PizzaShop Suisse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
