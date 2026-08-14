import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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