import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Pizza, Package, ChefHat, ListOrdered } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard | PizzaShop Suisse",
  description: "Manage orders and menu items",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch dashboard stats
  const { data: orders } = await supabase.from("orders").select("*");

  const activeOrders =
    orders?.filter((o) =>
      ["confirmed", "preparing", "ready", "delivering"].includes(o.status)
    ).length || 0;
  const todayOrders =
    orders?.filter((o) => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length || 0;

  const todayRevenue =
    orders
      ?.filter((o) => {
        const orderDate = new Date(o.created_at);
        const today = new Date();
        return (
          orderDate.toDateString() === today.toDateString() &&
          o.payment_status === "paid"
        );
      })
      .reduce((sum, o) => sum + o.total, 0) || 0;

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
            <Link href="/admin" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/admin/menu"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/admin/zones"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Zones
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Orders
              </CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders placed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <ListOrdered className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                CHF {todayRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Paid orders only</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your pizza shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Package className="w-5 h-5" />
                <div>
                  <p className="font-medium">Manage Orders</p>
                  <p className="text-sm text-muted-foreground">
                    View and update order statuses
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/menu"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <Pizza className="w-5 h-5" />
                <div>
                  <p className="font-medium">Manage Menu</p>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove pizzas
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/zones"
                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <ChefHat className="w-5 h-5" />
                <div>
                  <p className="font-medium">Delivery Zones</p>
                  <p className="text-sm text-muted-foreground">
                    Configure delivery areas and fees
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest orders and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {activeOrders} orders currently being prepared or delivered
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
