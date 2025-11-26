'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, ChefHat, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

interface MyOrdersProps {
  orders: any[]
}

export function MyOrders({ orders }: MyOrdersProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', icon: Clock, color: 'bg-muted text-muted-foreground' }
      case 'confirmed':
        return { label: 'Confirmed', icon: Package, color: 'bg-blue-500 text-white' }
      case 'preparing':
        return { label: 'Preparing', icon: ChefHat, color: 'bg-orange-500 text-white' }
      case 'ready':
        return { label: 'Ready', icon: CheckCircle, color: 'bg-green-500 text-white' }
      case 'delivering':
        return { label: 'Out for Delivery', icon: Truck, color: 'bg-primary text-primary-foreground' }
      case 'delivered':
        return { label: 'Delivered', icon: CheckCircle, color: 'bg-green-600 text-white' }
      case 'cancelled':
        return { label: 'Cancelled', icon: XCircle, color: 'bg-destructive text-destructive-foreground' }
      default:
        return { label: status, icon: Clock, color: 'bg-muted text-muted-foreground' }
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by ordering some delicious pizzas!
          </p>
          <Button asChild>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status)
        const StatusIcon = statusInfo.icon

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    {new Date(order.created_at).toLocaleDateString('en-CH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
                <Badge className={statusInfo.color}>
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items Summary */}
              <div className="space-y-2">
                {order.order_items?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.pizza_name} ({item.size_name})
                    </span>
                    <span>CHF {item.total_price.toFixed(2)}</span>
                  </div>
                ))}
                {order.order_items?.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    +{order.order_items.length - 3} more items
                  </p>
                )}
              </div>

              <Separator />

              {/* Order Total */}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>CHF {order.total.toFixed(2)}</span>
              </div>

              {/* Action Button */}
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/track?orderId=${order.id}`}>
                  View Details & Track
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
