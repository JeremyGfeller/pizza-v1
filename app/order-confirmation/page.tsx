'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      setStatus('error')
      return
    }

    // Fetch order details using the orderId
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error')
        } else {
          setOrderDetails(data)
          setStatus('success')
          // Clear cart and delivery zone from localStorage
          localStorage.removeItem('cart')
          localStorage.removeItem('deliveryZone')
        }
      })
      .catch(() => {
        setStatus('error')
      })
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Vérification du paiement...</h2>
          <p className="text-muted-foreground">Veuillez patienter</p>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Erreur de paiement</h2>
          <p className="text-muted-foreground mb-6">
            Une erreur est survenue lors de la vérification de votre paiement.
          </p>
          <Button onClick={() => router.push('/cart')} className="w-full">
            Retour au panier
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h2 className="text-3xl font-bold mb-2">Commande confirmée !</h2>
        <p className="text-muted-foreground mb-6">
          Merci pour votre commande. Vous allez recevoir un email de confirmation.
        </p>
        
        {orderDetails?.id && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
            <p className="text-lg font-mono font-bold">#{orderDetails.id.slice(0, 8)}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={`/track?id=${orderDetails?.id}`}>
              Suivre ma commande
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/menu">
              Commander à nouveau
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
