import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pizzaId: string }> }
) {
  try {
    const { pizzaId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update pizza
    const { data: pizza, error } = await supabase
      .from('pizzas')
      .update(body)
      .eq('id', pizzaId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(pizza)
  } catch (error) {
    console.error('[v0] Error updating pizza:', error)
    return NextResponse.json(
      { error: 'Failed to update pizza' },
      { status: 500 }
    )
  }
}
