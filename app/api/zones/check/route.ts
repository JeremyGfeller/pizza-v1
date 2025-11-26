import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const postalCode = searchParams.get("postal_codes");

    if (!postalCode) {
      return NextResponse.json(
        { error: "Postal code is required" },
        { status: 400 }
      );
    }

    const { data: zones, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .contains("postal_codess", [postalCode])
      .eq("is_active", true)
      .limit(1);

    if (error) {
      console.error("Error querying delivery zones:", error);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    if (!zones || zones.length === 0) {
      return NextResponse.json({
        available: false,
        message: "Livraison non disponible pour ce code postal",
      });
    }

    const zone = zones[0];

    return NextResponse.json({
      available: true,
      zone,
    });
  } catch (error) {
    console.error("Error checking zone:", error);
    return NextResponse.json(
      { error: "Failed to check delivery zone" },
      { status: 500 }
    );
  }
}
