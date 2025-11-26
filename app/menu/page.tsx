import { createClient } from "@/lib/supabase/server";
import { PizzaGrid } from "@/components/pizza-grid";
import { CategoryFilter } from "@/components/category-filter";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pizza, ShoppingCart, MapPin, Info } from "lucide-react";
import type { Category, DeliveryZone } from "@/lib/types";

export const metadata = {
  title: "Menu | PizzaShop Suisse",
  description: "Browse our delicious selection of authentic Swiss pizzas",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; postal_codes?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let deliveryZone: DeliveryZone | null = null;
  let enteredPostalCode: string | null = null;

  if (params.postal_codes) {
    enteredPostalCode = params.postal_codes;
    const { data: zones } = await supabase
      .from("delivery_zones")
      .select("*")
      .contains("postal_codess", [params.postal_codes])
      .eq("is_active", true)
      .limit(1);

    if (zones && zones.length > 0) {
      deliveryZone = zones[0];
    }
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  // Fetch pizzas with optional category filter
  let query = supabase
    .from("pizzas")
    .select("*, categories(name, slug)")
    .eq("is_available", true);

  if (params.category && params.category !== "all") {
    const category = categories?.find(
      (c: Category) => c.slug === params.category
    );
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  const { data: pizzas } = await query.order("name");

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
            <Link
              href="/track"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Button size="sm" variant="outline" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notre Menu</h1>
          <p className="text-lg text-muted-foreground">
            Choisissez parmi notre sélection de pizzas artisanales faites avec
            amour
          </p>
        </div>

        {deliveryZone && enteredPostalCode && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Livraison disponible - {deliveryZone.canton}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Code postal:</span>{" "}
                    <span className="font-medium">{enteredPostalCode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Frais de livraison:
                    </span>{" "}
                    <span className="font-semibold text-primary">
                      CHF {deliveryZone.delivery_fee.toFixed(2)}
                    </span>
                  </div>
                  {deliveryZone.min_order_amount > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Commande minimum:
                      </span>{" "}
                      <span className="font-medium">
                        CHF {deliveryZone.min_order_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">
                      Temps de livraison estimé:
                    </span>{" "}
                    <span className="font-medium">
                      {deliveryZone.estimated_delivery_minutes} min
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Changer</Link>
              </Button>
            </div>
          </div>
        )}

        {!deliveryZone && (
          <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Entrez votre code postal sur la page d'accueil pour voir les
                  frais de livraison et la disponibilité.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Entrer code postal</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter
          categories={categories || []}
          currentCategory={params.category}
        />

        {/* Pizza Grid */}
        <PizzaGrid pizzas={pizzas || []} />
      </main>
    </div>
  );
}
