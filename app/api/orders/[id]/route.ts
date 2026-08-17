import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ORDER_STATUS_VALUES } from '@/lib/orders'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const status = typeof body.status === 'string' ? body.status.trim() : ''
  if (!ORDER_STATUS_VALUES.includes(status as never)) {
    return NextResponse.json({ error: 'Estatus no válido. Usa: registrada, en proceso o pagado.' }, { status: 400 })
  }

  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order: data })
}