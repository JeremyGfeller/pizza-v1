'use client'

import { useCallback, useEffect } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  orderId: string
  amount: number
}

export function StripeCheckout({ orderId, amount }: StripeCheckoutProps) {
  const router = useRouter()
  
  const fetchClientSecret = useCallback(async () => {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    })
    const data = await response.json()
    return data.clientSecret
  }, [orderId, amount])

  const handleComplete = useCallback(() => {
    console.log('[v0] Payment completed, redirecting to confirmation page')
    // Clear cart from localStorage
    localStorage.removeItem('cart')
    // Redirect to order confirmation page
    router.push(`/order-confirmation?orderId=${orderId}`)
  }, [orderId, router])

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <EmbeddedCheckoutProvider 
          stripe={stripePromise} 
          options={{ 
            fetchClientSecret,
            onComplete: handleComplete
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </Card>
    </div>
  )
}
