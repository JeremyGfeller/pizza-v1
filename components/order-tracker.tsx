"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Search,
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

export function OrderTracker() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleTrackById = async () => {
    if (!orderId) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Order not found");
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackByEmail = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/by-email?email=${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        throw new Error("No orders found for this email");
      }
      const data = await response.json();
      if (data.length === 0) {
        throw new Error("No orders found for this email");
      }
      // Show the most recent order
      setOrder(data[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Order</CardTitle>
          <CardDescription>
            Track your order using your order ID or email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="order-id">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="order-id">Order ID</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="order-id" className="space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  placeholder="Enter your order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackById()}
                />
              </div>
              <Button onClick={handleTrackById} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Track Order
              </Button>
            </TabsContent>
            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrackByEmail()}
                />
              </div>
              <Button onClick={handleTrackByEmail} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Find Orders
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {order && <OrderDetails order={order} />}
    </div>
  );
}

function OrderDetails({ order }: { order: any }) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          color: "bg-muted text-muted-foreground",
          description: "Your order is being processed",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          icon: Package,
          color: "bg-blue-500 text-white",
          description: "Your order has been confirmed",
        };
      case "preparing":
        return {
          label: "Preparing",
          icon: ChefHat,
          color: "bg-orange-500 text-white",
          description: "Your pizzas are being prepared",
        };
      case "ready":
        return {
          label: "Ready",
          icon: CheckCircle,
          color: "bg-green-500 text-white",
          description: "Your order is ready for delivery",
        };
      case "delivering":
        return {
          label: "Out for Delivery",
          icon: Truck,
          color: "bg-primary text-primary-foreground",
          description: "Your order is on the way",
        };
      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle,
          color: "bg-green-600 text-white",
          description: "Your order has been delivered",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          color: "bg-destructive text-destructive-foreground",
          description: "Your order has been cancelled",
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: "bg-muted text-muted-foreground",
          description: "",
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const statuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "delivering",
    "delivered",
  ];
  const currentIndex = statuses.indexOf(order.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-CH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </div>
          <Badge className={statusInfo.color}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        {order.status !== "cancelled" && (
          <div>
            <h3 className="font-semibold mb-4">Order Progress</h3>
            <div className="space-y-4">
              {statuses.map((status, index) => {
                const info = getStatusInfo(status);
                const Icon = info.icon;
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={status} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? info.color
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-medium ${
                          isCurrent
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {info.label}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Delivery Information */}
        <div>
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <p className="text-muted-foreground">
            {order.delivery_street}
            <br />
            {order.delivery_postal_codes} {order.delivery_city}
            <br />
            {order.delivery_canton}
          </p>
          {order.estimated_delivery_time && (
            <p className="text-sm text-muted-foreground mt-2">
              Estimated delivery:{" "}
              {new Date(order.estimated_delivery_time).toLocaleTimeString(
                "en-CH",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          )}
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.pizza_name} ({item.size_name})
                </span>
                <span>CHF {item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>CHF {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>CHF {order.delivery_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>CHF {order.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>CHF {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Payment Status</span>
          <Badge
            variant={order.payment_status === "paid" ? "default" : "secondary"}
          >
            {order.payment_status === "paid" ? "Paid" : "Pending"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
