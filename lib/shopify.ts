const STOREFRONT_QUERY = `#graphql
  query Products($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        handle
        title
        description
        productType
        tags
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { id availableForSale } }
      }
    }
  }
`

type ShopifyResponse = {
  data?: { products: { nodes: ShopifyProduct[] } }
  errors?: Array<{ message: string }>
}

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  description: string
  productType: string
  tags: string[]
  featuredImage?: { url: string; altText?: string; width?: number; height?: number }
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  variants: { nodes: Array<{ id: string; availableForSale: boolean }> }
}

export async function getProducts(): Promise<ShopifyProduct[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (!domain || !token) return []

  const response = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query: STOREFRONT_QUERY, variables: { first: 24, query: 'product_type:agua' } }),
    next: { revalidate: 60 },
  })
  const json = (await response.json()) as ShopifyResponse
  if (!response.ok || json.errors) return []
  return json.data?.products.nodes ?? []
}

export function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currencyCode }).format(Number(amount))
}
