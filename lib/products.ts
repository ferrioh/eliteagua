import type { ShopifyProduct } from '@/lib/shopify'
import { createClient } from '@/lib/supabase/server'

export type CustomProductRow = {
  id: string
  created_at: string
  title: string
  description: string
  price: number
  currency_code: string
  image_url: string | null
  tags: string[]
  product_type: string
}

export function toShopifyProduct(product: CustomProductRow): ShopifyProduct {
  const handle = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'producto'
  return {
    id: `local-${product.id}`,
    handle,
    title: product.title,
    description: product.description,
    productType: product.product_type,
    tags: product.tags,
    featuredImage: product.image_url ? { url: product.image_url, altText: product.title } : undefined,
    priceRange: { minVariantPrice: { amount: String(product.price), currencyCode: product.currency_code } },
    variants: { nodes: [{ id: `local-v-${product.id}`, availableForSale: true }] },
  }
}

export async function getCustomProducts(): Promise<ShopifyProduct[]> {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []).map(toShopifyProduct)
}
