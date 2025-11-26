import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Leaf, Sprout, Flame } from 'lucide-react'
import type { Pizza } from '@/lib/types'

interface PizzaGridProps {
  pizzas: Pizza[]
}

export function PizzaGrid({ pizzas }: PizzaGridProps) {
  if (pizzas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No pizzas found in this category.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pizzas.map((pizza) => (
        <Card key={pizza.id} className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={pizza.image_url || `/placeholder.svg?height=300&width=300&query=delicious ${pizza.name} pizza`}
                alt={pizza.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xl">{pizza.name}</CardTitle>
              <span className="text-lg font-bold whitespace-nowrap">CHF {pizza.base_price.toFixed(2)}</span>
            </div>
            <CardDescription className="line-clamp-2">{pizza.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-wrap gap-2">
              {pizza.is_vegetarian && (
                <Badge variant="secondary" className="gap-1">
                  <Leaf className="w-3 h-3" />
                  Vegetarian
                </Badge>
              )}
              {pizza.is_vegan && (
                <Badge variant="secondary" className="gap-1">
                  <Sprout className="w-3 h-3" />
                  Vegan
                </Badge>
              )}
              {pizza.is_spicy && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="w-3 h-3" />
                  Spicy
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/menu/${pizza.slug}`}>Customize & Order</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
