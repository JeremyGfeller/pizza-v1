import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { orderId, amount } = await request.json()

    const supabase = await createClient()

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (!order) {
      throw new Error('Order not found')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Commande Pizza',
              description: `Commande #${orderId.slice(0, 8)}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      redirect_on_completion: 'never', // Added redirect_on_completion to disable automatic redirect since we handle it client-side
      metadata: {
        orderId,
      },
    })

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ payment_intent_id: session.payment_intent as string })
      .eq('id', orderId)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('[v0] Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
