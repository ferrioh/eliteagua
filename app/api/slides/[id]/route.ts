import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const direction = body?.direction
  if (direction !== 'up' && direction !== 'down') return NextResponse.json({ error: 'Dirección inválida.' }, { status: 400 })

  const { data: slides, error } = await supabase
    .from('slides')
    .select('id, position')
    .order('position', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const index = slides?.findIndex((slide) => slide.id === id)
  if (!slides || index === undefined || index === -1) return NextResponse.json({ error: 'Slide no encontrado.' }, { status: 404 })
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= slides.length) return NextResponse.json({ ok: true })

  const current = slides[index]
  const target = slides[targetIndex]
  await supabase.from('slides').update({ position: target.position }).eq('id', current.id)
  await supabase.from('slides').update({ position: current.position }).eq('id', target.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { data: slide } = await supabase.from('slides').select('image_url').eq('id', id).maybeSingle()
  if (slide?.image_url) {
    const marker = '/slide-images/'
    const index = slide.image_url.indexOf(marker)
    const path = index >= 0 ? slide.image_url.slice(index + marker.length) : null
    if (path) await supabase.storage.from('slide-images').remove([path])
  }

  const { error } = await supabase.from('slides').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}