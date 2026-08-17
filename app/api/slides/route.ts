import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ slides: [] })
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('position', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slides: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const image_url = typeof body.image_url === 'string' && body.image_url.trim() ? body.image_url.trim() : null
  if (!image_url) return NextResponse.json({ error: 'La imagen es obligatoria.' }, { status: 400 })

  const { data: last } = await supabase
    .from('slides')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
  const position = last?.length ? (last[0].position ?? 0) + 1 : 0

  const { data, error } = await supabase
    .from('slides')
    .insert({ image_url, position })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slide: data }, { status: 201 })
}