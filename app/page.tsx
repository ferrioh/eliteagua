import { Storefront } from '@/components/storefront'
import { getProducts } from '@/lib/shopify'
import { getCustomProducts } from '@/lib/products'
import { getSlides } from '@/lib/slides'

export default async function Page() {
  const [shopify, custom, slides] = await Promise.all([getProducts(), getCustomProducts(), getSlides()])
  return <Storefront products={[...shopify, ...custom]} slides={slides} />
}