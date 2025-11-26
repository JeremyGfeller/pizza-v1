import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      guestEmail,
      guestName,
      guestPhone,
      deliveryStreet,
      deliveryCity,
      deliveryPostalCode,
      deliveryCanton,
      deliveryNotes,
      subtotal,
      deliveryFee,
      tax,
      total,
      cart,
    } = body;

    const supabase = await createClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        guest_email: guestEmail,
        guest_name: guestName,
        guest_phone: guestPhone,
        delivery_street: deliveryStreet,
        delivery_city: deliveryCity,
        delivery_postal_codes: deliveryPostalCode,
        delivery_canton: deliveryCanton,
        delivery_notes: deliveryNotes,
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    for (const item of cart) {
      const { data: orderItem, error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: order.id,
          pizza_id: item.pizzaId,
          pizza_name: item.pizzaName,
          size_id: item.sizeId,
          size_name: item.sizeName,
          crust_type_id: item.crustTypeId,
          crust_type_name: item.crustTypeName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.unitPrice * item.quantity,
          special_instructions: item.specialInstructions,
        })
        .select()
        .single();

      if (itemError) {
        throw itemError;
      }

      // Add toppings
      if (item.toppingIds && item.toppingIds.length > 0) {
        const { data: toppings } = await supabase
          .from("toppings")
          .select("*")
          .in("id", item.toppingIds);

        if (toppings) {
          for (const topping of toppings) {
            await supabase.from("order_item_toppings").insert({
              order_item_id: orderItem.id,
              topping_id: topping.id,
              topping_name: topping.name,
              topping_price: topping.price,
            });
          }
        }
      }
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("[v0] Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
