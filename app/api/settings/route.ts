import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { defaultSettings } from '@/lib/settings'

const urlFields = ['instagram_url', 'facebook_url', 'x_url'] as const

function normalizeUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const url = value.trim()
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) return ''
  return url.slice(0, 500)
}

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ settings: defaultSettings })
  const { data, error } = await supabase
    .from('settings')
    .select('instagram_url, facebook_url, x_url')
    .eq('id', 'general')
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data ?? defaultSettings })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })

  const values: Partial<Record<(typeof urlFields)[number], string>> = {}
  for (const field of urlFields) values[field] = normalizeUrl(body[field])

  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: 'general', ...values, updated_at: new Date().toISOString() })
    .select('instagram_url, facebook_url, x_url')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}