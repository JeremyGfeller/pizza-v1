'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/types'

export function CartView() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [toppingsData, setToppingsData] = useState<Record<string, { name: string; price: number }>>({})

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Fetch toppings data for display
    fetch('/api/toppings')
      .then(res => res.json())
      .then(data => {
        const toppingsMap: Record<string, { name: string; price: number }> = {}
        data.forEach((topping: any) => {
          toppingsMap[topping.id] = { name: topping.name, price: topping.price }
        })
        setToppingsData(toppingsMap)
      })
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    updateCart(newCart)
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const newCart = [...cart]
    newCart[index].quantity = newQuantity
    updateCart(newCart)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some delicious pizzas to your cart to get started
        </p>
        <Button asChild>
          <Link href="/menu">Browse Menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-4">
        {cart.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.pizzaImage || `/placeholder.svg?height=96&width=96&query=${item.pizzaName} pizza`}
                    alt={item.pizzaName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.pizzaName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.sizeName} • {item.crustTypeName}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {item.toppingIds.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground">
                        Extra toppings: {item.toppingIds.map(id => toppingsData[id]?.name).filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="mb-2">
                      <p className="text-sm text-muted-foreground italic">
                        Note: {item.specialInstructions}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">CHF {(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">CHF {item.unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">CHF {calculateSubtotal().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>CHF {calculateSubtotal().toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Delivery fee and tax will be calculated at checkout
            </p>
            <Button size="lg" className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/menu">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
