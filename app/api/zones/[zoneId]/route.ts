import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { zoneId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data: zone, error } = await supabase
      .from("delivery_zones")
      .update({
        postal_codes: body.postal_codes,
        city: body.city,
        delivery_fee: body.delivery_fee,
        min_order_amount: body.min_order_amount,
      })
      .eq("id", zoneId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Error updating zone:", error);
    return NextResponse.json(
      { error: "Failed to update zone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { zoneId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("delivery_zones")
      .delete()
      .eq("id", zoneId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting zone:", error);
    return NextResponse.json(
      { error: "Failed to delete zone" },
      { status: 500 }
    );
  }
}
