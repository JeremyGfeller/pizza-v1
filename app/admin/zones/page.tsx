import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminZonesManager } from "@/components/admin-zones-manager";

export default async function AdminZonesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?redirect=/admin/zones");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  console.log(profile);

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data: zones } = await supabase
    .from("delivery_zones")
    .select("*")
    .order("postal_codes");

  console.log(zones);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Delivery Zones</h1>
              <p className="text-sm text-muted-foreground">
                Manage delivery zones and fees
              </p>
            </div>
            <a href="/admin" className="text-sm text-primary hover:underline">
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <AdminZonesManager initialZones={zones || []} />
      </main>
    </div>
  );
}
