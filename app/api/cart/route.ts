import { NextResponse } from 'next/server'

const CART_CREATE = `mutation CartCreate($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { checkoutUrl } userErrors { message } } }`

export async function POST(request: Request) {
  const body = (await request.json()) as { lines?: Array<{ merchandiseId: string; quantity: number }> }
  const lines = body.lines?.filter((line) => line.merchandiseId && line.quantity > 0) ?? []
  if (!lines.length) return NextResponse.json({ error: 'La cesta está vacía.' }, { status: 400 })
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!domain || !token) return NextResponse.json({ error: 'Shopify no está configurado.' }, { status: 503 })
  const response = await fetch(`https://${domain}/api/2026-07/graphql.json`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token }, body: JSON.stringify({ query: CART_CREATE, variables: { lines } }) })
  const json = await response.json() as { data?: { cartCreate?: { cart?: { checkoutUrl: string }; userErrors?: Array<{ message: string }> } }; errors?: Array<{ message: string }> }
  const errors = json.errors ?? json.data?.cartCreate?.userErrors ?? []
  if (!response.ok || errors.length) return NextResponse.json({ error: errors[0]?.message || 'No se pudo crear el checkout.' }, { status: 400 })
  return NextResponse.json({ checkoutUrl: json.data?.cartCreate?.cart?.checkoutUrl })
}
