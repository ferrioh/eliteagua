import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ orders: [] })
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const customer_name = typeof body.customer_name === 'string' ? body.customer_name.trim() : ''
  const customer_city = typeof body.customer_city === 'string' ? body.customer_city.trim() : ''
  const customer_id_number = typeof body.customer_id_number === 'string' ? body.customer_id_number.trim() : ''
  const customer_phone = typeof body.customer_phone === 'string' ? body.customer_phone.trim() : ''
  const quantity = Number(body.quantity) || 1
  const total_price = Number(body.total_price) || 0
  const currency = typeof body.currency === 'string' && body.currency ? body.currency : 'USD'
  const items = Array.isArray(body.items) ? body.items : []
  const auth0_user_id = typeof body.auth0_user_id === 'string' ? body.auth0_user_id : null
  const auth0_user_email = typeof body.auth0_user_email === 'string' ? body.auth0_user_email : null

  if (!customer_name || !customer_phone) {
    return NextResponse.json({ error: 'Nombre y teléfono son obligatorios.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_city,
      customer_id_number,
      customer_phone,
      quantity,
      total_price,
      currency,
      items,
      auth0_user_id,
      auth0_user_email,
      status: 'completed'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: data }, { status: 201 })
}
