"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  ChefHat,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminOrdersListProps {
  orders: any[];
}

export function AdminOrdersList({
  orders: initialOrders,
}: AdminOrdersListProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock,
          color: "bg-muted text-muted-foreground",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          icon: Package,
          color: "bg-blue-500 text-white",
        };
      case "preparing":
        return {
          label: "Preparing",
          icon: ChefHat,
          color: "bg-orange-500 text-white",
        };
      case "ready":
        return {
          label: "Ready",
          icon: CheckCircle,
          color: "bg-green-500 text-white",
        };
      case "delivering":
        return {
          label: "Delivering",
          icon: Truck,
          color: "bg-primary text-primary-foreground",
        };
      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle,
          color: "bg-green-600 text-white",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          color: "bg-destructive text-destructive-foreground",
        };
      default:
        return {
          label: status,
          icon: Clock,
          color: "bg-muted text-muted-foreground",
        };
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      router.refresh();
    } catch (error) {
      console.error("[v0] Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filterOrders = (status: string) => {
    if (status === "all") return orders;
    if (status === "active") {
      return orders.filter((o) =>
        ["confirmed", "preparing", "ready", "delivering"].includes(o.status)
      );
    }
    return orders.filter((o) => o.status === status);
  };

  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">
          Active ({filterOrders("active").length})
        </TabsTrigger>
        <TabsTrigger value="confirmed">
          Confirmed ({filterOrders("confirmed").length})
        </TabsTrigger>
        <TabsTrigger value="preparing">
          Preparing ({filterOrders("preparing").length})
        </TabsTrigger>
        <TabsTrigger value="delivering">
          Delivering ({filterOrders("delivering").length})
        </TabsTrigger>
        <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
      </TabsList>

      {(["active", "confirmed", "preparing", "delivering", "all"] as const).map(
        (tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {filterOrders(tab).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No orders in this category
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterOrders(tab).map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleString("en-CH")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.user_id
                              ? "Registered user"
                              : `Guest: ${order.guest_email}`}
                          </p>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Items:</h4>
                        <div className="space-y-1">
                          {order.order_items?.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.quantity}x {item.pizza_name} (
                                {item.size_name})
                                {item.order_item_toppings?.length > 0 && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    + extras
                                  </span>
                                )}
                              </span>
                              <span>CHF {item.total_price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Delivery Info */}
                      <div>
                        <h4 className="font-semibold mb-2">Delivery:</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.delivery_street}
                          <br />
                          {order.delivery_postal_codes} {order.delivery_city}
                        </p>
                        {order.delivery_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: {order.delivery_notes}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Total */}
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>CHF {order.total.toFixed(2)}</span>
                      </div>

                      {/* Status Update */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Update Status:
                        </span>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value)
                          }
                          disabled={updatingOrder === order.id}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivering">
                              Delivering
                            </SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingOrder === order.id && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        )
      )}
    </Tabs>
  );
}
