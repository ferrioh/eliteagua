import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ profiles: [] })
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profiles: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const auth0_user_id = typeof body.auth0_user_id === 'string' && body.auth0_user_id ? body.auth0_user_id : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const city = typeof body.city === 'string' ? body.city.trim() : ''
  const address = typeof body.address === 'string' ? body.address.trim() : ''
  const id_number = typeof body.id_number === 'string' ? body.id_number.trim() : ''

  if (!email) return NextResponse.json({ error: 'El correo es obligatorio.' }, { status: 400 })
  if (!full_name) return NextResponse.json({ error: 'El nombre completo es obligatorio.' }, { status: 400 })

  const existing = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  const payload = {
    auth0_user_id,
    email,
    full_name,
    phone,
    city,
    address,
    id_number,
    updated_at: new Date().toISOString(),
  }

  if (existing.data?.id) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(payload)
      .eq('id', existing.data.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ profile: data })
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .insert(payload)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data }, { status: 201 })
}
