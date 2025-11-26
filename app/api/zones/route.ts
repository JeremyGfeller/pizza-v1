import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: zones, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .order("postal_codes");

    if (error) throw error;

    return NextResponse.json(zones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data: zone, error } = await supabase
      .from("delivery_zones")
      .insert({
        postal_codes: body.postal_codes,
        city: body.city,
        delivery_fee: body.delivery_fee,
        min_order_amount: body.min_order_amount,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error creating zone:", error);
    return NextResponse.json(
      { error: "Failed to create zone" },
      { status: 500 }
    );
  }
}
