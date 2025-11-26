'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Leaf, Sprout, Flame, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Pizza, PizzaSize, CrustType, Topping } from '@/lib/types'

interface PizzaCustomizerProps {
  pizza: Pizza
  sizes: PizzaSize[]
  crustTypes: CrustType[]
  toppings: Topping[]
}

export function PizzaCustomizer({ pizza, sizes, crustTypes, toppings }: PizzaCustomizerProps) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>(sizes[1]?.id || sizes[0]?.id || '')
  const [selectedCrust, setSelectedCrust] = useState<string>(crustTypes[0]?.id || '')
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Calculate price
  const calculatePrice = () => {
    const size = sizes.find(s => s.id === selectedSize)
    const crust = crustTypes.find(c => c.id === selectedCrust)
    const toppingsCost = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppings.find(t => t.id === toppingId)
      return sum + (topping?.price || 0)
    }, 0)

    const basePrice = pizza.base_price
    const sizeMultiplier = size?.price_multiplier || 1
    const crustPrice = crust?.additional_price || 0

    return (basePrice * sizeMultiplier + crustPrice + toppingsCost) * quantity
  }

  const handleToppingToggle = (toppingId: string) => {
    setSelectedToppings(prev =>
      prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]
    )
  }

  const handleAddToCart = () => {
    const size = sizes.find(s => s.id === selectedSize)
    const crust = crustTypes.find(c => c.id === selectedCrust)

    const cartItem = {
      pizzaId: pizza.id,
      pizzaName: pizza.name,
      pizzaImage: pizza.image_url,
      sizeId: selectedSize,
      sizeName: size?.name || '',
      crustTypeId: selectedCrust,
      crustTypeName: crust?.name || '',
      toppingIds: selectedToppings,
      quantity,
      unitPrice: calculatePrice() / quantity,
      specialInstructions: specialInstructions || undefined,
    }

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem('cart')
    const cart = existingCart ? JSON.parse(existingCart) : []
    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))

    // Navigate to cart
    router.push('/cart')
  }

  const groupedToppings = toppings.reduce((acc, topping) => {
    const category = topping.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(topping)
    return acc
  }, {} as Record<string, Topping[]>)

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left column - Image and description */}
      <div>
        <Card>
          <CardHeader>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={pizza.image_url || `/placeholder.svg?height=600&width=600&query=delicious ${pizza.name} pizza`}
                alt={pizza.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-3xl">{pizza.name}</CardTitle>
            </div>
            <CardDescription className="text-base">{pizza.description}</CardDescription>
            <div className="flex flex-wrap gap-2 pt-2">
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
          </CardHeader>
        </Card>
      </div>

      {/* Right column - Customization options */}
      <div className="space-y-6">
        {/* Size selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Size</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
              <div className="space-y-3">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={size.id} id={size.id} />
                      <Label htmlFor={size.id} className="cursor-pointer font-medium">
                        {size.name} ({size.diameter_cm}cm)
                      </Label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      CHF {(pizza.base_price * size.price_multiplier).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Crust selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Crust</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedCrust} onValueChange={setSelectedCrust}>
              <div className="space-y-3">
                {crustTypes.map((crust) => (
                  <div key={crust.id} className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <RadioGroupItem value={crust.id} id={crust.id} />
                      <div className="cursor-pointer flex-1">
                        <Label htmlFor={crust.id} className="cursor-pointer font-medium block">
                          {crust.name}
                        </Label>
                        {crust.description && (
                          <p className="text-sm text-muted-foreground">{crust.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {crust.additional_price > 0 ? `+CHF ${crust.additional_price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Toppings selection */}
        <Card>
          <CardHeader>
            <CardTitle>Add Extra Toppings</CardTitle>
            <CardDescription>Customize your pizza with additional toppings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedToppings).map(([category, categoryToppings]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {categoryToppings.map((topping) => (
                      <div key={topping.id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={topping.id}
                            checked={selectedToppings.includes(topping.id)}
                            onCheckedChange={() => handleToppingToggle(topping.id)}
                          />
                          <Label htmlFor={topping.id} className="cursor-pointer flex items-center gap-2">
                            {topping.name}
                            {topping.is_vegan && <Sprout className="w-3 h-3 text-muted-foreground" />}
                          </Label>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          +CHF {topping.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Special instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special requests? (e.g., extra sauce, light cheese)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Quantity and Add to Cart */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">CHF {calculatePrice().toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
