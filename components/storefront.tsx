'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { ArrowRight, Bot, ChevronDown, Clock, Droplets, Grid2X2, List, Mail, MapPin, Menu, MessageCircle, Minus, Plus, Search, Send, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'
import type { ShopifyProduct } from '@/lib/shopify'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/shopify'
import type { SiteSettings } from '@/lib/settings'

type Props = { products: ShopifyProduct[]; slides: string[]; settings: SiteSettings }
type CartItem = { product: ShopifyProduct; quantity: number }

function InstagramIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
}
function FacebookIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
}
function XLogoIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
}
const fallbackProducts: ShopifyProduct[] = [
  { id: 'elite-600', handle: 'elite-600ml', title: 'Elite 600 ML', description: 'Caja de 16 unidades. Agua mineral Elite en formato práctico para llevar contigo.', productType: 'Agua mineral', tags: ['600 ML', 'Caja 16 unidades'], featuredImage: { url: '/elite-600ml-white.png', altText: 'Caja de agua Elite de 600 mililitros' }, priceRange: { minVariantPrice: { amount: '12.00', currencyCode: 'USD' } }, variants: { nodes: [{ id: 'elite-v600', availableForSale: true }] } },
  { id: 'elite-1500', handle: 'elite-1500ml', title: 'Elite 1.5 L', description: 'Caja de 12 unidades. El formato ideal para compartir en casa o en la oficina.', productType: 'Agua mineral', tags: ['1.5 L', 'Caja 12 unidades'], featuredImage: { url: '/elite-1500ml-white.png', altText: 'Caja de agua Elite de 1.5 litros' }, priceRange: { minVariantPrice: { amount: '15.00', currencyCode: 'USD' } }, variants: { nodes: [{ id: 'elite-v1500', availableForSale: true }] } },
  { id: 'elite-350', handle: 'elite-350ml', title: 'Elite 350 ML', description: 'Caja de 24 unidades. Un formato ligero para eventos, reuniones y consumo diario.', productType: 'Agua mineral', tags: ['350 ML', 'Caja 24 unidades'], featuredImage: { url: '/elite-350ml-white.png', altText: 'Caja de agua Elite de 350 mililitros' }, priceRange: { minVariantPrice: { amount: '18.00', currencyCode: 'USD' } }, variants: { nodes: [{ id: 'elite-v350', availableForSale: true }] } },
]

const staggerContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const cardVariants: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }
const contactContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } } }
const contactCard: Variants = { hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } } }
const spring = { type: 'spring', stiffness: 300, damping: 22 } as const

export function Storefront({ products, slides: initialSlides, settings }: Props) {
  const slides = initialSlides.length ? initialSlides : ['/elite-slide.jpg', '/elite-slide-2.png', '/elite-slide-3.png']
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ShopifyProduct | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  useEffect(() => { try { const saved = window.sessionStorage.getItem('elite-cart'); if (saved) setCart(JSON.parse(saved)) } catch {} }, [])
  useEffect(() => { try { window.sessionStorage.setItem('elite-cart', JSON.stringify(cart)); const supabase = createClient(); void supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } | null }) => { if (data?.user) void supabase.from('carts').upsert({ user_id: data.user.id, items: cart, updated_at: new Date().toISOString() }) }) } catch {} }, [cart])
  const [cartOpen, setCartOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [orderOpen, setOrderOpen] = useState(false)
  const [order, setOrder] = useState({ name: '', city: '', quantity: '', id: '', phone: '' })
  const [mobileMenu, setMobileMenu] = useState(false)
  useEffect(() => { const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 4000); return () => window.clearInterval(timer) }, [slides.length])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const { messages, sendMessage, status } = useChat({
    messages: [{ id: 'welcome', role: 'assistant', parts: [{ type: 'text', text: '¡Bienvenido! Te puedo ayudar a elegir tu agua mineral.' }] }],
  })
  const catalog = products.length ? products : fallbackProducts
  const filtered = useMemo(() => catalog.filter((product) => `${product.title} ${product.description} ${product.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [catalog, search])
  const count = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + Number(item.product.priceRange.minVariantPrice.amount) * item.quantity, 0)
  const currency = cart[0]?.product.priceRange.minVariantPrice.currencyCode || 'EUR'

  function addToCart(product: ShopifyProduct) {
    setCart((items) => items.some((item) => item.product.id === product.id) ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }])
    setSelected(null)
    setCartOpen(true)
  }
  function changeQuantity(id: string, delta: number) { setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)) }
  function checkout() { setOrderOpen(true) }
  function sendOrderToWhatsApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const products = cart.map((item) => `${item.product.title} x${item.quantity}`).join(', ')
    const message = `Hola Elite, quiero realizar un pedido. Nombre: ${order.name}. Ciudad: ${order.city}. Cédula: ${order.id}. Teléfono: ${order.phone}. Cantidad: ${order.quantity}. Productos: ${products}. Total estimado: ${formatPrice(String(subtotal), currency)}`
    window.open(`https://wa.me/584129412247?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }
  function askAssistant(event?: React.FormEvent) {
    event?.preventDefault()
    const text = question.trim()
    if (!text || status === 'streaming' || status === 'submitted') return
    setQuestion('')
    void sendMessage({ text })
  }

  return <main className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} className="md:hidden" aria-label="Abrir menú" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}</motion.button>
      <motion.a href="#inicio" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        <motion.img src="/elite-logo.jpg" alt="Elite" className="size-9 rounded-full object-cover" whileHover={{ rotate: 12 }} transition={spring} />
        <span className="text-[#e30613]">elite</span>
      </motion.a>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        {[['#catalogo', 'Catálogo'], ['#origen', 'Nuestro origen'], ['#contacto', 'Contactos']].map(([href, label]) => <motion.a key={href} href={href} whileHover="hover" whileTap={{ scale: 0.95 }} className="relative text-sm text-muted-foreground hover:text-foreground"><motion.span className="absolute inset-x-0 -bottom-1.5 h-0.5 origin-left rounded-full bg-[#e30613]" initial={{ scaleX: 0 }} variants={{ hover: { scaleX: 1 } }} transition={{ duration: 0.25, ease: 'easeOut' }} />{label}</motion.a>)}
        <motion.a href="/admin/login" whileHover="hover" whileTap={{ scale: 0.95 }} className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><motion.span className="absolute inset-x-0 -bottom-1.5 h-0.5 origin-left rounded-full bg-[#e30613]" initial={{ scaleX: 0 }} variants={{ hover: { scaleX: 1 } }} transition={{ duration: 0.25, ease: 'easeOut' }} /><UserRound className="size-4" /> Admin</motion.a>
      </nav>
      <motion.button onClick={() => setCartOpen(true)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }} className="flex items-center gap-2 text-sm font-medium" aria-label="Abrir cesta">
        <motion.span whileHover={{ rotate: -15 }} transition={spring}><ShoppingBag className="size-4 text-primary" /></motion.span>
        <span className="hidden sm:inline">Cesta</span>
        <span className="relative inline-grid min-w-6 place-items-center overflow-hidden rounded-full bg-[#e30613] px-2 py-0.5 text-xs text-white">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={count} initial={{ scale: 0, y: -12, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0, y: 12, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }} className="inline-block">{count}</motion.span>
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
      <AnimatePresence initial={false}>
        {mobileMenu && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="flex flex-col gap-5 overflow-hidden border-t border-border pt-5 mt-4 text-sm md:hidden">
          {[['#catalogo', 'Catálogo'], ['#origen', 'Nuestro origen'], ['#contacto', 'Contactos']].map(([href, label]) => <motion.a key={href} href={href} whileTap={{ scale: 0.97, x: 4 }} onClick={() => setMobileMenu(false)}>{label}</motion.a>)}
          <motion.a href="/admin/login" className="flex items-center gap-2" whileTap={{ scale: 0.97, x: 4 }} onClick={() => setMobileMenu(false)}><UserRound className="size-4" /> Acceso administrativo</motion.a>
          <motion.button className="text-left" whileTap={{ scale: 0.97, x: 4 }} onClick={() => { setCartOpen(true); setMobileMenu(false) }}>Ver cesta</motion.button>
        </motion.nav>}
      </AnimatePresence>
    </header>
    <section id="inicio" className="bg-primary px-4 pb-5 pt-3 text-primary-foreground md:px-10 md:py-10"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1197c5] shadow-sm"><div className="relative grid min-h-[280px] grid-cols-[1.05fr_.95fr] items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={slide} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.75, ease: 'easeInOut' }} className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0 before:bg-primary/10" style={{ backgroundImage: `url(${slides[slide]})` }} />
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">{slides.map((_, index) => <motion.button key={index} aria-label={`Ir al slide ${index + 1}`} onClick={() => setSlide(index)} animate={slide === index ? { scale: 1.35, backgroundColor: '#e30613' } : { scale: 1, backgroundColor: 'rgba(255,255,255,0.7)' }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="size-2 rounded-full" />)}</div>
      <div className="relative z-10 px-5 py-10 md:px-12" aria-hidden="true" />
    </div></div></section>
    <section id="catalogo" className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
      <motion.div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
        <div><p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Colección mineral</p><h2 className="font-serif text-4xl tracking-tight md:text-5xl">Elige tu origen</h2></div>
        <div className="flex items-center gap-4">
          <label className="flex min-w-0 flex-1 items-center gap-3 border-b border-border pb-3 text-sm text-muted-foreground md:w-64"><Search className="size-4 shrink-0" /><span className="sr-only">Buscar productos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar agua" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" /></label>
          <div className="flex border border-border p-1" aria-label="Cambiar distribución">{['grid', 'list'].map((mode) => <motion.button key={mode} aria-label={mode === 'grid' ? 'Vista en cuadrícula' : 'Vista en lista'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} className={`p-2 ${view === mode ? 'bg-primary text-primary-foreground' : ''}`} onClick={() => setView(mode as 'grid' | 'list')}>{mode === 'grid' ? <Grid2X2 className="size-4" /> : <List className="size-4" />}</motion.button>)}</div>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className={view === 'grid' ? 'grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12' : 'flex flex-col gap-3'}>
        {filtered.map((product) => <motion.article key={product.id} variants={cardVariants} whileHover={view === 'grid' ? { y: -10 } : { x: 8 }} whileTap={{ scale: 0.98 }} transition={spring} className={view === 'grid' ? 'group cursor-pointer' : 'flex cursor-pointer items-center gap-4 border-b border-border py-3'} onClick={() => setSelected(product)}>
          <div className={view === 'grid' ? 'relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-secondary' : 'relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary sm:size-24'}>
            <motion.img src={product.featuredImage?.url || '/placeholder.jpg'} alt={product.featuredImage?.altText || product.title} className="size-full object-cover mix-blend-multiply" whileHover={{ scale: 1.1 }} transition={{ duration: 0.45, ease: 'easeOut' }} />
            <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[9px] uppercase tracking-[0.12em] backdrop-blur">{product.tags[0] || 'Mineral'}</span>
          </div>
          <div className="min-w-0 flex-1"><h3 className={view === 'grid' ? 'font-serif text-xl leading-tight group-hover:text-[#e30613]' : 'font-serif text-2xl'}>{product.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p></div>
          <p className="shrink-0 text-sm font-medium">{formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p>
        </motion.article>)}
      </motion.div>
      {filtered.length === 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center text-muted-foreground">No encontramos ese origen. Prueba otra búsqueda.</motion.p>}
    </section>
    <motion.section id="origen" className="border-y border-border bg-[#98e5ff] px-5 py-14 pb-28 md:px-10 md:py-20" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}><div className="mx-auto max-w-7xl">
      <div className="mb-10 grid gap-6 md:grid-cols-[.7fr_1fr] md:items-end"><div><p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Encuéntranos</p><h2 className="font-serif text-3xl leading-tight md:text-5xl">Agua Elite,<br />cerca de ti.</h2></div><p className="max-w-3xl font-serif text-2xl leading-tight md:text-4xl">Cada botella conserva la historia del lugar donde nace.</p></div>
      <motion.div id="contacto" variants={contactContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-5 md:grid-cols-3">
        <motion.div variants={contactCard} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-background p-6 shadow-lg shadow-primary/5">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#1197c5]/10 text-[#1197c5]"><MapPin className="size-6" /></span>
          <div><p className="font-semibold text-primary">Ubicación</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Urb. Campo Dowell, Anaco 6003,<br />Anzoátegui, Venezuela</p></div>
          <iframe title="Mapa de ubicación de Elite" src="https://www.google.com/maps?q=Urb.%20Campo%20Dowell%2C%20Anaco%2C%20Anzo%C3%A1tegui%2C%20Venezuela&output=embed" className="mt-auto h-36 w-full rounded-2xl border-0" loading="lazy" />
        </motion.div>
        <motion.div variants={contactCard} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-background p-6 shadow-lg shadow-primary/5">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#1197c5]/10 text-[#1197c5]"><Mail className="size-6" /></span>
          <div><p className="font-semibold text-primary">Escríbenos</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Resolvemos tus dudas y pedidos por correo o WhatsApp.</p></div>
          <div className="mt-auto flex flex-col gap-2.5">
            <motion.a href="mailto:embotelladora.elite@gmail.com" whileHover={{ x: 6, color: '#e30613' }} className="flex items-center gap-2.5 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium"><Mail className="size-4 shrink-0 text-[#1197c5]" /><span className="truncate">embotelladora.elite@gmail.com</span></motion.a>
            <motion.a href="https://wa.me/584129412247" whileHover={{ x: 6, color: '#e30613' }} className="flex items-center gap-2.5 rounded-2xl bg-secondary px-4 py-3 text-sm font-medium"><MessageCircle className="size-4 shrink-0 text-[#1197c5]" />+58 412-9412247</motion.a>
          </div>
        </motion.div>
        <motion.div variants={contactCard} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-background p-6 shadow-lg shadow-primary/5">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#1197c5]/10 text-[#1197c5]"><Clock className="size-6" /></span>
          <div><p className="font-semibold text-primary">Horario de atención</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Estamos para atenderte de lunes a sábado.</p></div>
          <div className="mt-auto grid gap-2 text-sm"><div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3"><span className="text-muted-foreground">Lunes a viernes</span><strong className="text-primary">8:00 a.m. – 6:00 p.m.</strong></div><div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3"><span className="text-muted-foreground">Sábados</span><strong className="text-primary">8:00 a.m. – 12:00 m.</strong></div></div>
        </motion.div>
      </motion.div>
    </div></motion.section>
    <footer className="bg-primary px-5 py-10 text-primary-foreground md:px-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
      <motion.a href="#inicio" className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
        <img src="/elite-logo.jpg" alt="Elite" className="size-9 rounded-full object-cover" />
        <span>elite</span>
      </motion.a>
      <div className="flex items-center gap-3">
        {[['instagram_url', InstagramIcon, 'Instagram'], ['facebook_url', FacebookIcon, 'Facebook'], ['x_url', XLogoIcon, 'X']].map(([key, Icon, label]) => {
          const url = settings[key as keyof SiteSettings]
          return url ? <motion.a key={key as string} href={url} target="_blank" rel="noopener noreferrer" aria-label={label as string} whileHover={{ y: -4, scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring} className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-[#e30613]"><Icon className="size-5" /></motion.a> : <span key={key as string} className="grid size-11 place-items-center rounded-full bg-white/10 text-primary-foreground/30" aria-hidden="true"><Icon className="size-5" /></span>
        })}
      </div>
      <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} Agua Elite · Todos los derechos reservados</p>
    </div></footer>
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-background/95 px-4 py-3 text-[10px] font-semibold text-muted-foreground shadow-[0_-8px_24px_rgba(8,45,100,.08)] backdrop-blur md:hidden" aria-label="Navegación principal">
      <motion.a href="#inicio" className="flex flex-col items-center gap-1 text-primary" whileTap={{ scale: 0.9 }}><Droplets className="size-5" /> Inicio</motion.a>
      <motion.a href="#catalogo" className="flex flex-col items-center gap-1" whileTap={{ scale: 0.9 }}><Grid2X2 className="size-5" /> Tienda</motion.a>
      <motion.button onClick={() => setCartOpen(true)} whileTap={{ scale: 0.9 }} className="relative flex flex-col items-center gap-1"><ShoppingBag className="size-5" /> Cesta{count > 0 && <AnimatePresence initial={false}><motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#e30613] text-[9px] text-white">{count}</motion.span></AnimatePresence>}</motion.button>
      <motion.a href="#contacto" className="flex flex-col items-center gap-1" whileTap={{ scale: 0.9 }}><Mail className="size-5" /> Contacto</motion.a>
    </nav>
    <motion.button aria-label="Abrir asistente" onClick={() => setChatOpen(!chatOpen)} whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.85 }} animate={{ y: [0, -6, 0] }} transition={{ y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }} className="fixed bottom-24 right-3 z-20 grid size-14 place-items-center rounded-full bg-[#1197c5] text-white shadow-xl">
      <motion.span className="absolute inset-0 rounded-full bg-[#1197c5]/40" animate={{ scale: [1, 1.45], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
      <motion.span className="relative grid place-items-center" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}><Droplets className="size-7" /></motion.span>
    </motion.button>
    <AnimatePresence>
      {chatOpen && <motion.section initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.95 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="fixed bottom-32 right-4 z-40 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden border border-border bg-background shadow-2xl" aria-label="Asistente de manantial">
        <div className="flex items-center gap-3 bg-primary p-4 text-primary-foreground"><motion.span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground" animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}><Bot className="size-5" /></motion.span><div><p className="font-medium">Bienvenido</p><p className="text-xs text-primary-foreground/70">Te puedo ayudar</p></div><motion.button onClick={() => setChatOpen(false)} whileHover={{ rotate: 90 }} transition={spring} className="ml-auto" aria-label="Cerrar asistente"><X className="size-4" /></motion.button></div>
        <div className="flex max-h-64 flex-col gap-3 overflow-y-auto p-4"><AnimatePresence initial={false}>{messages.map((message: { id: string; role: string; parts: Array<{ type: string; text?: string }> }) => <motion.p key={message.id} layout initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }} className={`max-w-[85%] px-3 py-2 text-sm leading-5 ${message.role === 'user' ? 'ml-auto bg-secondary' : 'bg-muted'}`}>{message.parts.filter((part) => part.type === 'text').map((part) => part.type === 'text' ? part.text : '').join('')}</motion.p>)}</AnimatePresence></div>
        <div className="flex gap-2 border-t border-border p-3"><form onSubmit={askAssistant} className="flex min-w-0 flex-1 gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Escribe tu pregunta" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><motion.button type="submit" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.85 }} disabled={status === 'streaming' || status === 'submitted'} aria-label="Enviar pregunta" className="grid size-9 place-items-center bg-primary text-primary-foreground disabled:opacity-50"><Send className="size-4" /></motion.button></form></div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {selected && <motion.div role="dialog" aria-modal="true" aria-label={`Detalle de ${selected.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 p-0 md:items-center md:p-6" onClick={() => setSelected(null)}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="grid max-h-[90vh] w-full max-w-4xl overflow-auto bg-background md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
          <div className="relative aspect-square bg-secondary md:aspect-auto"><motion.img src={selected.featuredImage?.url || '/placeholder.jpg'} alt={selected.featuredImage?.altText || selected.title} className="size-full object-cover mix-blend-multiply" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} /></div>
          <div className="flex flex-col gap-8 p-7 md:p-10"><motion.button aria-label="Cerrar detalle" onClick={() => setSelected(null)} whileHover={{ rotate: 90 }} transition={spring} className="ml-auto text-muted-foreground"><X className="size-5" /></motion.button><div><p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{selected.productType || 'Agua mineral'}</p><h2 className="font-serif text-4xl tracking-tight">{selected.title}</h2><p className="mt-6 leading-7 text-muted-foreground">{selected.description}</p></div><div className="mt-auto flex items-center justify-between border-t border-border pt-6"><p className="text-lg font-medium">{formatPrice(selected.priceRange.minVariantPrice.amount, selected.priceRange.minVariantPrice.currencyCode)}</p><motion.button onClick={() => addToCart(selected)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} className="rounded-full bg-[#e30613] px-5 py-3 text-sm font-medium text-white">Añadir a la cesta</motion.button></div></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {orderOpen && <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/40 p-4 md:items-center" onClick={() => setOrderOpen(false)}>
        <motion.form onSubmit={sendOrderToWhatsApp} initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 24 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Pedido Elite</p><h2 className="text-2xl font-extrabold text-primary">Completa tus datos</h2></div><motion.button type="button" whileHover={{ rotate: 90 }} transition={spring} onClick={() => setOrderOpen(false)} aria-label="Cerrar formulario"><X className="size-5" /></motion.button></div>
          <div className="grid gap-3">{[['name', 'Nombre completo', 'text'], ['city', 'Ciudad', 'text'], ['id', 'Cédula', 'text'], ['phone', 'Número de teléfono', 'text'], ['quantity', 'Cantidad total', 'number']].map(([field, placeholder, type]) => <motion.input key={field} required type={type} min={type === 'number' ? '1' : undefined} placeholder={placeholder} value={order[field as keyof typeof order]} onChange={(event) => setOrder({ ...order, [field]: event.target.value })} whileFocus={{ scale: 1.02, borderColor: '#e30613' }} className="rounded-xl border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-[#e30613]" />)}</div>
          <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3.5 font-bold text-white">Continuar por WhatsApp <ArrowRight className="size-4" /></motion.button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Se abrirá WhatsApp con el resumen de tu pedido.</p>
        </motion.form>
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {cartOpen && <>
        <motion.div role="dialog" aria-modal="true" aria-label="Cesta de compra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-primary/35" onClick={() => setCartOpen(false)} />
        <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-border p-5"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tu pedido</p><h2 className="font-serif text-3xl">Cesta <span className="font-sans text-sm text-muted-foreground">({count})</span></h2></div><motion.button onClick={() => setCartOpen(false)} whileHover={{ rotate: 90 }} transition={spring} aria-label="Cerrar cesta"><X className="size-5" /></motion.button></div>
          {cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"><motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}><ShoppingBag className="size-8 text-muted-foreground" /></motion.span><p className="text-sm text-muted-foreground">Tu cesta está esperando una botella.</p></div> : <>
            <div className="flex-1 overflow-y-auto p-5"><AnimatePresence initial={false}>{cart.map((item) => <motion.div key={item.product.id} layout initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 48, height: 0 }} transition={spring} className="flex gap-3 overflow-hidden border-b border-border py-4 first:pt-0">
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-secondary"><motion.img src={item.product.featuredImage?.url || '/placeholder.jpg'} alt="" className="size-full object-cover mix-blend-multiply" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} /></div>
              <div className="min-w-0 flex-1"><h3 className="font-serif text-lg">{item.product.title}</h3><p className="text-sm text-muted-foreground">{formatPrice(item.product.priceRange.minVariantPrice.amount, item.product.priceRange.minVariantPrice.currencyCode)}</p><div className="mt-3 flex items-center gap-3"><motion.button whileTap={{ scale: 0.8 }} onClick={() => changeQuantity(item.product.id, -1)} aria-label="Reducir cantidad" className="border border-border p-1"><Minus className="size-3" /></motion.button><span className="text-sm">{item.quantity}</span><motion.button whileTap={{ scale: 0.8 }} onClick={() => changeQuantity(item.product.id, 1)} aria-label="Aumentar cantidad" className="border border-border p-1"><Plus className="size-3" /></motion.button><motion.button whileTap={{ scale: 0.8 }} onClick={() => setCart((items) => items.filter((cartItem) => cartItem.product.id !== item.product.id))} aria-label="Eliminar producto" className="ml-auto text-muted-foreground"><Trash2 className="size-4" /></motion.button></div></div>
            </motion.div>)}</AnimatePresence></div>
            <div className="border-t border-border p-5"><div className="mb-4 flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><strong>{formatPrice(subtotal.toFixed(2), currency)}</strong></div><motion.button onClick={checkout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-sm font-medium text-primary-foreground">Ir a pagar <ChevronDown className="size-4 -rotate-90" /></motion.button><p className="mt-3 text-center text-xs text-muted-foreground">El pago seguro se completa en Shopify.</p></div>
          </>}
        </motion.aside>
      </>}
    </AnimatePresence>
  </main>
}
