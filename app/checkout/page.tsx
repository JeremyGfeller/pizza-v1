import { CheckoutForm } from '@/components/checkout-form'
import Link from 'next/link'
import { Pizza } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Checkout | PizzaShop Suisse',
  description: 'Complete your order',
}

export default async function CheckoutPage() {
  const supabase = await createClient()
  
  // Fetch delivery zones
  const { data: deliveryZones } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, fetch their profile and addresses
  let profile = null
  let addresses = null
  
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    const { data: addressData } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
    
    profile = profileData
    addresses = addressData
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PizzaShop Suisse</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <CheckoutForm 
          deliveryZones={deliveryZones || []} 
          user={user}
          profile={profile}
          addresses={addresses || []}
        />
      </main>
    </div>
  )
}
