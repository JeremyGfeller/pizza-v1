import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const orderId = session.metadata?.orderId

      if (orderId) {
        const supabase = await createClient()

        // Update order payment status
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
          })
          .eq('id', orderId)

        console.log('[v0] Order payment confirmed:', orderId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
