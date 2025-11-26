import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check both user_id (for authenticated users) and guest_email
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          order_item_toppings (*)
        )
      `)
      .order('created_at', { ascending: false })

    if (user && user.email === email) {
      // Authenticated user - show their orders
      query = query.eq('user_id', user.id)
    } else {
      // Guest user - show orders by email
      query = query.eq('guest_email', email)
    }

    const { data: orders, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('[v0] Error fetching orders by email:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
