import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ products: [] })
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const price = Number(body.price)
  const currency_code = typeof body.currency_code === 'string' && body.currency_code ? body.currency_code : 'USD'
  const image_url = typeof body.image_url === 'string' && body.image_url ? body.image_url : null
  const product_type = typeof body.product_type === 'string' && body.product_type.trim() ? body.product_type.trim() : 'Agua mineral'
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 12) : []

  if (!title) return NextResponse.json({ error: 'El nombre del producto es obligatorio.' }, { status: 400 })
  if (!Number.isFinite(price) || price < 0) return NextResponse.json({ error: 'El precio debe ser un número válido.' }, { status: 400 })

  const { data, error } = await supabase
    .from('products')
    .insert({ title, description, price, currency_code, image_url, tags, product_type })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data }, { status: 201 })
}