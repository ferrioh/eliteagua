import { Storefront } from '@/components/storefront'
import { getProducts } from '@/lib/shopify'
import { getCustomProducts } from '@/lib/products'
import { getSlides } from '@/lib/slides'
import { getSettings } from '@/lib/settings'

export default async function Page() {
  const [shopify, custom, slides, settings] = await Promise.all([getProducts(), getCustomProducts(), getSlides(), getSettings()])
  return <Storefront products={[...shopify, ...custom]} slides={slides} settings={settings} />
}