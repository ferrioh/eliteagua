import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>

async function nextTicketNumber(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('increment_order_sequence')
  if (!error && typeof data === 'number' && Number.isFinite(data)) {
    return `ELITE-${String(data).padStart(4, '0')}`
  }
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  return `ELITE-${String((count ?? 0) + 1).padStart(4, '0')}`
}

export async function GET(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ orders: [] })

  const url = new URL(request.url)
  const email = url.searchParams.get('email')

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (email) query = query.eq('auth0_user_email', email)

  const { data, error } = await query
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

  const ticket_number = await nextTicketNumber(supabase)

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
      ticket_number,
      status: 'registrada',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: data }, { status: 201 })
}