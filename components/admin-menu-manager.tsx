'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Pizza, Category } from '@/lib/types'

interface AdminMenuManagerProps {
  pizzas: Pizza[]
  categories: Category[]
}

export function AdminMenuManager({ pizzas: initialPizzas, categories }: AdminMenuManagerProps) {
  const router = useRouter()
  const [pizzas, setPizzas] = useState(initialPizzas)

  const handleToggleAvailability = async (pizzaId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/pizzas/${pizzaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !isAvailable }),
      })

      if (!response.ok) {
        throw new Error('Failed to update pizza')
      }

      // Update local state
      setPizzas(pizzas.map(pizza =>
        pizza.id === pizzaId ? { ...pizza, is_available: !isAvailable } : pizza
      ))

      router.refresh()
    } catch (error) {
      console.error('[v0] Error updating pizza:', error)
      alert('Failed to update pizza availability')
    }
  }

  const groupedPizzas = pizzas.reduce((acc, pizza) => {
    const categorySlug = (pizza as any).categories?.slug || 'uncategorized'
    if (!acc[categorySlug]) {
      acc[categorySlug] = []
    }
    acc[categorySlug].push(pizza)
    return acc
  }, {} as Record<string, Pizza[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Manage your pizza menu items and availability
        </p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Pizza
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Pizzas ({pizzas.length})</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.slug}>
              {category.name} ({groupedPizzas[category.slug]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {pizzas.map((pizza) => (
              <Card key={pizza.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pizza.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        CHF {pizza.base_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pizza.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pizza.is_vegetarian && (
                      <Badge variant="secondary">Vegetarian</Badge>
                    )}
                    {pizza.is_vegan && (
                      <Badge variant="secondary">Vegan</Badge>
                    )}
                    {pizza.is_spicy && (
                      <Badge variant="destructive">Spicy</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor={`available-${pizza.id}`}>Available</Label>
                    <Switch
                      id={`available-${pizza.id}`}
                      checked={pizza.is_available}
                      onCheckedChange={() => handleToggleAvailability(pizza.id, pizza.is_available)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.slug} className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {groupedPizzas[category.slug]?.map((pizza) => (
                <Card key={pizza.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pizza.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          CHF {pizza.base_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pizza.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pizza.is_vegetarian && (
                        <Badge variant="secondary">Vegetarian</Badge>
                      )}
                      {pizza.is_vegan && (
                        <Badge variant="secondary">Vegan</Badge>
                      )}
                      {pizza.is_spicy && (
                        <Badge variant="destructive">Spicy</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Label htmlFor={`available-${pizza.id}`}>Available</Label>
                      <Switch
                        id={`available-${pizza.id}`}
                        checked={pizza.is_available}
                        onCheckedChange={() => handleToggleAvailability(pizza.id, pizza.is_available)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
