import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const values: Record<string, unknown> = {}
  if (typeof body.title === 'string') values.title = body.title.trim()
  if (typeof body.description === 'string') values.description = body.description.trim()
  if (body.price !== undefined) {
    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'El precio debe ser un número válido.' }, { status: 400 })
    values.price = price
  }
  if (typeof body.currency_code === 'string' && body.currency_code) values.currency_code = body.currency_code
  if (typeof body.image_url === 'string') values.image_url = body.image_url.trim() || null
  if (Array.isArray(body.tags)) values.tags = body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 12)
  if (typeof body.product_type === 'string' && body.product_type.trim()) values.product_type = body.product_type.trim()
  if (typeof body.title === 'string' && !values.title) return NextResponse.json({ error: 'El nombre del producto es obligatorio.' }, { status: 400 })

  const { data, error } = await supabase.from('products').update(values).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { data: product } = await supabase.from('products').select('image_url').eq('id', id).maybeSingle()
  if (product?.image_url) {
    const marker = '/product-images/'
    const index = product.image_url.indexOf(marker)
    const path = index >= 0 ? product.image_url.slice(index + marker.length) : null
    if (path) await supabase.storage.from('product-images').remove([path])
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}