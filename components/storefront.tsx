'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { useAuth0 } from '@auth0/auth0-react'
import { Activity, ArrowRight, Clock, Droplet, Droplets, Grid2X2, List, LogIn, LogOut, Mail, MapPin, Menu, MessageCircle, Minus, Package, Plus, Search, Send, ShoppingBag, Sparkles, Ticket, Trash2, UserRound, X } from 'lucide-react'
import type { ShopifyProduct } from '@/lib/shopify'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/shopify'
import type { SiteSettings } from '@/lib/settings'
import { getOrderStatusMeta, type OrderRow } from '@/lib/orders'
import { ThemeToggle } from './theme-toggle'

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
function GoogleIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" /><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" /><path fill="#FBBC05" d="M5.27 14.29A7 7 0 0 1 4.89 12c0-.79.14-1.57.38-2.29V6.62H1.29A11.86 11.86 0 0 0 0 12c0 1.94.47 3.76 1.29 5.38l3.98-3.09z" /><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.9 11.9 0 0 0 12 0C7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" /></svg>
}
function GeminiIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 0C11.72 7.12 7.12 11.72 0 12c7.12.28 11.72 4.88 12 12 .28-7.12 4.88-11.72 12-12-7.12-.28-11.72-4.88-12-12Z" /></svg>
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
const origenContainer: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.16, delayChildren: 0.12 } } }
const origenItem: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } } }
const chipVariants: Variants = { hidden: { opacity: 0, y: 18, scale: 0.92 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } } }
const originMetrics = [
  { label: 'Aguas hechas', value: 128.5, decimals: 1, suffix: 'M', icon: Droplet, accent: '#38c6f0', progress: 0.92 },
  { label: 'Aguas vendidas', value: 96.3, decimals: 1, suffix: 'M', icon: ShoppingBag, accent: '#56c7f2', progress: 0.84 },
  { label: 'Estados llegados', value: 24, decimals: 0, suffix: '', icon: MapPin, accent: '#7fd9f7', progress: 0.7 },
  { label: 'Preferencias', value: 5, decimals: 0, suffix: ' formatos', icon: Droplets, accent: '#b8ecff', progress: 0.6 },
  { label: 'Productividad', value: 1200, decimals: 0, suffix: '/min', icon: Activity, accent: '#e30613', progress: 0.88 },
  { label: 'Pureza', value: 99.7, decimals: 1, suffix: '%', icon: Sparkles, accent: '#ff6b7d', progress: 1 },
] as const

const easeApple = [0.22, 1, 0.36, 1] as const

function Reveal({ children, className, delay = 0, y = 26 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: easeApple }}
    >
      {children}
    </motion.div>
  )
}

function TickerItem({ metric, reduce }: { metric: (typeof originMetrics)[number]; reduce: boolean | null }) {
  const Icon = metric.icon
  const dots = 5
  const filled = Math.round(metric.progress * dots)
  const number = metric.decimals ? metric.value.toFixed(metric.decimals) : String(metric.value)
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/25 dark:border-white/20 dark:bg-white/10 px-4 py-2 shadow-lg shadow-[#0a4566]/10 backdrop-blur-xl">
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#38c6f0] to-[#0e7fb5] text-white shadow-md shadow-[#1197c5]/40">
        <motion.span animate={reduce ? undefined : { y: [0, -1.5, 0], rotate: [0, 6, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="grid"><Icon className="size-4" /></motion.span>
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0e7fb5] dark:text-white">{metric.label}</p>
        <div className="mt-0.5 flex items-center gap-2.5">
          <p className="font-serif text-lg font-bold leading-none text-[#0e7fb5] dark:text-white">{number}<span className="text-sm font-semibold text-[#1197c5] dark:text-white/70">{metric.suffix}</span></p>
          <div className="flex items-center gap-1">
            {Array.from({ length: dots }).map((_, i) => <span key={i} className={`size-1.5 rounded-full ${i < filled ? 'bg-[#1197c5]' : 'bg-[#1197c5]/20'}`} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Storefront({ products, slides: initialSlides, settings }: Props) {
  const slides = initialSlides.length ? initialSlides : ['/elite-slide.jpg', '/elite-slide-2.png', '/elite-slide-3.png']
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ShopifyProduct | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const reduce = useReducedMotion()
  
  const { isAuthenticated = true, user, loginWithRedirect, logout } = useAuth0()

  useEffect(() => {
    const saved = window.sessionStorage.getItem('elite-cart')
    if (!saved) return
    const restore = () => {
      try { setCart(JSON.parse(saved)) } catch {}
    }
    const frame = window.requestAnimationFrame(restore)
    return () => window.cancelAnimationFrame(frame)
  }, [])
  useEffect(() => { try { window.sessionStorage.setItem('elite-cart', JSON.stringify(cart)); const supabase = createClient(); void supabase?.auth.getUser().then(({ data }: { data: { user: { id: string } | null } | null }) => { if (data?.user) void supabase.from('carts').upsert({ user_id: data.user.id, items: cart, updated_at: new Date().toISOString() }) }) } catch {} }, [cart])
  const [cartOpen, setCartOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const [orderOpen, setOrderOpen] = useState(false)
  const [order, setOrder] = useState({ name: '', city: '', quantity: '1', id: '', phone: '' })
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState({ full_name: '', phone: '', city: '', address: '', id_number: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileView, setProfileView] = useState<'info' | 'orders'>('info')
  const [userOrders, setUserOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [lastOrderTicket, setLastOrderTicket] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  useEffect(() => { const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 4000); return () => window.clearInterval(timer) }, [slides.length])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const { messages, sendMessage, status } = useChat()
  const catalog = products.length ? products : fallbackProducts
  const filtered = useMemo(() => catalog.filter((product) => `${product.title} ${product.description} ${product.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [catalog, search])
  const count = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + Number(item.product.priceRange.minVariantPrice.amount) * item.quantity, 0)
  const currency = cart[0]?.product.priceRange.minVariantPrice.currencyCode || 'USD'

  useEffect(() => {
    if (!user) return
    const frame = window.requestAnimationFrame(() => {
      setOrder((prev) => ({ ...prev, name: prev.name || user.name || '' }))
      setProfile((prev) => ({ ...prev, full_name: prev.full_name || user.name || '', phone: prev.phone || '' }))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [user])

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_user_id: user?.sub || null,
          email: user?.email || '',
          full_name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          address: profile.address,
          id_number: profile.id_number,
        }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo guardar tu información.')
      setProfileSaved(true)
    } catch (error) {
      console.error(error)
      setProfileSaved(true)
    } finally {
      setSavingProfile(false)
    }
  }

  function openProfile() {
    setProfileOpen(true)
    setProfileView('info')
    if (!user?.email) return
    setOrdersLoading(true)
    Promise.all([
      fetch(`/api/orders?email=${encodeURIComponent(user.email)}`).then((response) => response.json()),
      fetch(`/api/profile?email=${encodeURIComponent(user.email)}`).then((response) => response.json()),
    ])
      .then(([ordersJson, profileJson]) => {
        setUserOrders(Array.isArray(ordersJson.orders) ? ordersJson.orders : [])
        const saved = Array.isArray(profileJson.profiles) ? profileJson.profiles[0] : null
        if (saved) {
          setProfile({
            full_name: saved.full_name || user.name || '',
            phone: saved.phone || '',
            city: saved.city || '',
            address: saved.address || '',
            id_number: saved.id_number || '',
          })
          setOrder((prev) => ({
            ...prev,
            name: prev.name || saved.full_name || user.name || '',
            city: prev.city || saved.city || '',
            id: prev.id || saved.id_number || '',
            phone: prev.phone || saved.phone || '',
          }))
        }
      })
      .catch(() => setUserOrders([]))
      .finally(() => setOrdersLoading(false))
  }

  function addToCart(product: ShopifyProduct) {
    setCart((items) => items.some((item) => item.product.id === product.id) ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }])
    setSelected(null)
    setCartOpen(true)
  }
  function changeQuantity(id: string, delta: number) { setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0)) }
  
  function handleLogout() {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.toLowerCase().includes('auth0')) keysToRemove.push(key)
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      const supabase = createClient()
      void supabase?.auth.signOut()
    } catch {}
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''
    const canUseAuth0 = !!logout && !!domain && !domain.includes('elite-agua.us.auth0.com') && !!clientId && !clientId.includes('mock_client_id') && !clientId.includes('dummy_client_id')
    if (canUseAuth0) {
      try {
        logout({ logoutParams: { returnTo: window.location.origin, clientId } })
        window.setTimeout(() => { window.location.assign(window.location.origin) }, 2500)
      } catch {
        window.location.assign(window.location.origin)
      }
    } else {
      window.location.assign(window.location.origin)
    }
  }
  
  function handleAuthLogin() {
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''
    if (!loginWithRedirect || !domain || domain.includes('elite-agua.us.auth0.com') || !clientId || clientId.includes('mock_client_id') || clientId.includes('dummy_client_id')) {
      alert('Configuración de Auth0 pendiente:\n\nEl dominio "elite-agua.us.auth0.com" es un ejemplo genérico. Para activar el inicio de sesión con Gmail real en Vercel:\n1. Regístrate en auth0.com\n2. Crea una aplicación SPA\n3. Añade tus variables NEXT_PUBLIC_AUTH0_DOMAIN y NEXT_PUBLIC_AUTH0_CLIENT_ID en Vercel.\n\nActualmente puedes continuar comprando como invitado.')
      return
    }
    try {
      loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          prompt: 'select_account',
          redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      })
    } catch (err) {
      console.error(err)
      alert('Error al iniciar sesión con Auth0.')
    }
  }

  function checkout() {
    if (!isAuthenticated) {
      handleAuthLogin()
      return
    }
    setCartOpen(false)
    setOrderOpen(true)
  }

  async function submitOrderAndWhatsApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingOrder(true)
    let ticketNumber = ''
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: order.name,
          customer_city: order.city,
          customer_id_number: order.id,
          customer_phone: order.phone,
          quantity: Number(order.quantity) || count,
          total_price: subtotal,
          currency,
          items: cart,
          auth0_user_id: user?.sub || null,
          auth0_user_email: user?.email || null,
        }),
      })
      const json = await response.json()
      if (response.ok && json.order?.ticket_number) {
        ticketNumber = json.order.ticket_number
        setLastOrderTicket(ticketNumber)
      }
    } catch {}
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0_user_id: user?.sub || null,
          email: user?.email || '',
          full_name: order.name,
          phone: order.phone,
          city: order.city,
          address: '',
          id_number: order.id,
        }),
      })
    } catch {}
    setSavingOrder(false)
    setOrderSuccess(true)

    const productNames = cart.map((item) => `${item.product.title} x${item.quantity}`).join(', ')
    const message = `Hola Elite, quiero realizar un pedido. Número de pedido: ${ticketNumber || 'Pendiente'}. Nombre: ${order.name}. Ciudad: ${order.city}. Cédula: ${order.id}. Teléfono: ${order.phone}. Cantidad total: ${order.quantity}. Productos: ${productNames}. Total estimado: ${formatPrice(String(subtotal), currency)}. Puedes ver el estatus de este pedido con el ticket en mi perfil.`
    window.open(`https://wa.me/584129412247?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setCart([])
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
      </nav>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <div className="hidden items-center gap-2 text-xs md:flex">
            <span className="rounded-full bg-secondary px-3 py-1.5 font-medium text-foreground">{user.name || user.email}</span>
            <motion.button onClick={openProfile} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-1.5 rounded-full bg-[#1197c5] px-3 py-1.5 font-semibold text-white shadow" title="Ver mi perfil y mis pedidos"><UserRound className="size-3.5" /> Mi perfil</motion.button>
            <button onClick={handleLogout} className="rounded-full p-1.5 text-muted-foreground hover:text-destructive" title="Cerrar sesión"><LogOut className="size-4" /></button>
          </div>
        ) : (
          <>
            <motion.button onClick={handleAuthLogin} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} transition={spring} aria-label="Registrarse o iniciar sesión con Google" className="flex items-center gap-2 rounded-full border border-[#1197c5]/30 bg-white/80 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-[#1197c5] shadow-sm backdrop-blur-md dark:border-[#1197c5]/40 dark:bg-white/10 md:hidden"><GoogleIcon className="size-5" /> Registrarse o iniciar sesión</motion.button>
            <motion.button onClick={handleAuthLogin} whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(17,151,197,0.35)' }} whileTap={{ scale: 0.94 }} transition={spring} className="group hidden items-center gap-2 rounded-full border border-[#1197c5]/30 bg-white/80 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-[#1197c5] shadow-sm backdrop-blur-md dark:border-[#1197c5]/40 dark:bg-white/10 md:inline-flex">
              <span className="grid size-6 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"><GoogleIcon className="size-3.5" /></span>
              <span className="relative"><span className="absolute inset-0 origin-left rounded-full bg-[#1197c5]/15 blur-[2px]" />Iniciar con Gmail</span>
            </motion.button>
          </>
        )}
        <ThemeToggle className="rounded-full border border-border bg-background/60 backdrop-blur" />
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
    </div>
      <AnimatePresence initial={false}>
        {mobileMenu && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="flex flex-col gap-5 overflow-hidden border-t border-border pt-5 mt-4 text-sm md:hidden">
          {[['#catalogo', 'Catálogo'], ['#origen', 'Nuestro origen'], ['#contacto', 'Contactos']].map(([href, label]) => <motion.a key={href} href={href} whileTap={{ scale: 0.97, x: 4 }} onClick={() => setMobileMenu(false)}>{label}</motion.a>)}
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-primary"><UserRound className="size-4 text-[#1197c5]" /> {user.name || user.email}</span>
                <button onClick={handleLogout} className="text-xs text-destructive">Cerrar sesión</button>
              </div>
              <motion.button whileTap={{ scale: 0.97, x: 4 }} onClick={() => { openProfile(); setMobileMenu(false) }} className="flex items-center gap-2 text-left font-semibold text-[#1197c5]"><UserRound className="size-4" /> Mi perfil y mis pedidos</motion.button>
            </>
          ) : (
            <button onClick={handleAuthLogin} className="flex items-center gap-2 font-semibold text-[#1197c5]"><GoogleIcon className="size-4" /> Iniciar sesión con Gmail</button>
          )}
          <motion.button className="text-left" whileTap={{ scale: 0.97, x: 4 }} onClick={() => { setCartOpen(true); setMobileMenu(false) }}>Ver cesta</motion.button>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">Apariencia</span>
            <ThemeToggle />
          </div>
        </motion.nav>}
      </AnimatePresence>
    </header>
    <section id="inicio" className="relative w-full overflow-hidden text-primary-foreground"><div className="relative h-[300px] w-full overflow-hidden sm:h-[420px] lg:h-[560px]">
      <motion.div className="flex h-full cursor-grab active:cursor-grabbing" animate={{ x: `${-slide * 100}%` }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} drag="x" dragElastic={0.12} onDragEnd={(_event, info) => { if (info.offset.x < -60) setSlide((value) => (value + 1) % slides.length); else if (info.offset.x > 60) setSlide((value) => (value - 1 + slides.length) % slides.length) }}>
        {slides.map((url, index) => <div key={index} className="relative h-full w-full shrink-0 overflow-hidden"><img src={url} alt={`Slide ${index + 1} de Agua Elite`} draggable={false} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async" className="size-full object-cover object-center" /><div className="pointer-events-none absolute inset-0 bg-primary/10" /></div>)}
      </motion.div>

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-3 sm:inset-x-6 sm:p-5">
        <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-lg shadow-[#0a4566]/10 backdrop-blur-xl dark:bg-white/10">
          <motion.span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e30613] text-white shadow" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}><Sparkles className="size-3.5" /></motion.span>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Nuevos</span>
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <motion.div className="flex w-max items-center gap-4" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
              {[...catalog, ...catalog].map((product, i) => (
                <a key={`${product.id}-${i}`} href="#catalogo" className="flex shrink-0 items-center gap-2 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm transition-colors hover:bg-white dark:bg-slate-900/85 dark:hover:bg-slate-900">
                  <img src={product.featuredImage?.url || '/placeholder.jpg'} alt="" className="size-4 rounded-full object-cover mix-blend-multiply" />
                  <span className="whitespace-nowrap">{product.title}</span>
                  <span className="whitespace-nowrap text-[#e30613]">{formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</span>
                </a>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="pointer-events-auto hidden shrink-0 items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 shadow-lg shadow-[#0a4566]/10 backdrop-blur-xl sm:flex" role="tablist" aria-label="Progreso de las diapositivas">
          {slides.map((_, index) => <button key={index} role="tab" aria-selected={slide === index} aria-label={`Ir al slide ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${slide === index ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />)}
        </div>
      </div>

      <motion.div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/40 bg-white/25 px-3 py-1.5 shadow-lg shadow-[#0a4566]/15 backdrop-blur-xl dark:border-white/30 dark:bg-white/10 sm:bottom-7 sm:gap-3 sm:px-3.5" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}>
        <span className="block text-sm font-bold tracking-[0.18em] tabular-nums sm:text-base">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={slide} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }} className="inline-block">{String(slide + 1).padStart(2, '0')}</motion.span>
          </AnimatePresence>
          <span className="mx-1 font-light text-white/60">/</span>{String(slides.length).padStart(2, '0')}
        </span>
        <span className="h-4 w-px bg-white/40" />
        <span className="flex items-center gap-1.5">
          {slides.map((_, index) => {
            const active = slide === index
            return (
              <button key={index} role="tab" aria-selected={active} aria-label={`Ir al slide ${index + 1}`} onClick={() => setSlide(index)} className="flex h-2 cursor-pointer items-center">
                {active ? (
                  <span className="relative flex h-1.5 w-7 overflow-hidden rounded-full bg-white/30">
                    <motion.span key={slide} className="h-full rounded-full bg-white" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 4, ease: 'linear' }} />
                  </span>
                ) : (
                  <motion.span animate={{ scale: 1, opacity: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="block size-1.5 rounded-full bg-white transition-colors hover:bg-white/90" />
                )}
              </button>
            )
          })}
        </span>
      </motion.div>
    </div></section>
    <section id="catalogo" className="relative mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-20">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <motion.div className="absolute -left-24 top-24 size-72 rounded-full bg-[#1197c5]/15 blur-3xl" animate={{ x: [0, 24, 0], y: [0, 16, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-24 top-1/3 size-80 rounded-full bg-[#98e5ff]/40 blur-3xl" animate={{ x: [0, -20, 0], y: [0, -12, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-8 left-1/4 size-64 rounded-[3rem] bg-gradient-to-br from-[#1197c5]/10 to-[#e30613]/10 blur-2xl" animate={{ rotate: [0, 18, 0], scale: [1, 1.06, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.span className="absolute left-1/2 top-1/2 size-40 rounded-full border border-dashed border-[#1197c5]/20" animate={{ scale: [1, 1.25], opacity: [0.4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeOut' }} />
      </div>
      <div className="relative z-10">
      <motion.div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
        <div>
          <motion.p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1197c5]/20 bg-[#1197c5]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1197c5] backdrop-blur"><motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="inline-grid"><Droplets className="size-3.5" /></motion.span> Colección mineral</motion.p>
          <h2 className="font-serif text-4xl tracking-tight md:text-5xl">Elige tu <motion.span className="inline-block bg-gradient-to-r from-[#0e7fb5] via-[#1197c5] to-[#56c7f2] bg-clip-text italic text-transparent" style={{ backgroundSize: '200% 100%' }} animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], y: [0, -4, 0] }} transition={{ backgroundPosition: { duration: 5, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}>origen</motion.span></h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Agua mineral Elite, envasada en el manantial. Elige tu formato favorito y lo llevamos a tu mesa.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#1197c5]/20 bg-white/70 px-4 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-md transition-colors focus-within:border-[#1197c5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1197c5]/20 dark:bg-white/10 dark:focus-within:bg-[#0b2531] md:w-64"><Search className="size-4 shrink-0 text-[#1197c5]" /><span className="sr-only">Buscar productos</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar agua" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" /></label>
          <div className="flex gap-1 rounded-full border border-[#1197c5]/20 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:bg-white/10" aria-label="Cambiar distribución">{['grid', 'list'].map((mode) => <motion.button key={mode} aria-label={mode === 'grid' ? 'Vista en cuadrícula' : 'Vista en lista'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} className={`rounded-full p-2 transition-colors ${view === mode ? 'bg-[#1197c5] text-white shadow' : 'text-muted-foreground'}`} onClick={() => setView(mode as 'grid' | 'list')}>{mode === 'grid' ? <Grid2X2 className="size-4" /> : <List className="size-4" />}</motion.button>)}</div>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className={view === 'grid' ? 'grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16' : 'flex flex-col gap-4'}>
        {filtered.map((product) => <motion.article key={product.id} layout variants={cardVariants} whileHover={view === 'grid' ? { y: -12 } : { x: 8 }} whileTap={{ scale: 0.98 }} transition={spring} className={view === 'grid' ? 'group relative cursor-pointer rounded-[2rem] border border-white/70 bg-white/55 p-3 shadow-lg shadow-[#1197c5]/10 backdrop-blur-xl transition-shadow duration-300 hover:shadow-2xl hover:shadow-[#1197c5]/25' : 'flex cursor-pointer items-center gap-4 rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-md shadow-[#1197c5]/5 backdrop-blur-xl transition-shadow hover:shadow-xl hover:shadow-[#1197c5]/15'} onClick={() => setSelected(product)}>
          <div className={view === 'grid' ? 'relative mb-4 aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-[#dff6ff] via-[#eafaff] to-[#f7feff] shadow-inner transition-shadow duration-300 group-hover:shadow-xl' : 'relative size-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#dff6ff] to-[#f7feff] sm:size-24'}>
            <motion.span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-[#1197c5]/15 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.span className="pointer-events-none absolute -bottom-6 -left-6 size-20 rounded-full bg-[#e30613]/10 blur-xl" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.img src={product.featuredImage?.url || '/placeholder.jpg'} alt={product.featuredImage?.altText || product.title} loading="lazy" decoding="async" className="relative size-full object-cover mix-blend-multiply" whileHover={{ scale: 1.12 }} transition={{ duration: 0.55, ease: 'easeOut' }} />
            <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0e7fb5] backdrop-blur-md">{product.tags[0] || 'Mineral'}</span>
            <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#1197c5] to-[#0e7fb5] text-white opacity-0 shadow-lg shadow-[#1197c5]/40 transition-opacity duration-300 group-hover:opacity-100"><Plus className="size-4" /></motion.span>
          </div>
          <div className={view === 'grid' ? 'min-w-0 px-1 pb-1' : 'min-w-0 flex-1'}>
            <div className="flex items-start justify-between gap-2"><h3 className={`font-serif leading-tight transition-colors group-hover:text-[#1197c5] ${view === 'grid' ? 'text-xl' : 'text-2xl'}`}>{product.title}</h3><p className="shrink-0 rounded-full bg-[#1197c5]/10 px-2.5 py-1 text-xs font-bold text-[#1197c5]">{formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}</p></div>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground dark:text-slate-800">{product.description}</p>
          </div>
        </motion.article>)}
      </motion.div>
      {filtered.length === 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center text-muted-foreground">No encontramos ese origen. Prueba otra búsqueda.</motion.p>}
      </div>
    </section>
    <div className="relative z-10 overflow-hidden border-y border-[#1197c5]/15 bg-gradient-to-r from-[#cdeeff] via-[#e8f9ff] to-[#cdeeff] py-2.5 shadow-inner shadow-[#1197c5]/10 dark:from-[#0a2430] dark:via-[#0d2b3a] dark:to-[#0a2430]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(86,199,242,0.3),transparent_45%),radial-gradient(circle_at_88%_50%,rgba(227,6,19,0.1),transparent_45%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1197c5]/40 to-transparent" aria-hidden="true" />
      <Reveal>
        <div className="relative flex items-center gap-4 overflow-hidden">
          <div className="z-10 flex shrink-0 items-center gap-2.5 rounded-full border border-white/60 bg-white/25 dark:border-white/20 dark:bg-white/10 px-4 py-1.5 shadow-lg shadow-[#0a4566]/10 backdrop-blur-xl">
            <span className="relative flex size-2"><motion.span className="absolute inline-flex size-full rounded-full bg-[#e30613]" animate={{ scale: [1, 2.4], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} /><span className="relative inline-flex size-2 rounded-full bg-[#e30613]" /></span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e7fb5] dark:text-white">Analítica Elite</span>
          </div>
          <motion.div className="flex shrink-0 items-center gap-3 pr-4" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}>
            {[...originMetrics, ...originMetrics].map((metric, i) => <TickerItem key={i} metric={metric} reduce={reduce} />)}
          </motion.div>
        </div>
      </Reveal>
    </div>
    <motion.section id="origen" className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#eafaff] via-[#dff4ff] to-[#f4fcff] px-5 py-12 dark:from-[#0a2430] dark:via-[#0d2b3a] dark:to-[#081d27] md:py-16" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <motion.div className="absolute -left-24 top-16 size-72 rounded-full bg-[#1197c5]/15 blur-3xl" animate={{ x: [0, 24, 0], y: [0, 16, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-20 bottom-10 size-80 rounded-full bg-[#98e5ff]/50 blur-3xl" animate={{ x: [0, -20, 0], y: [0, -12, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div variants={origenContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} className="flex flex-col items-center text-center">
          <motion.p variants={origenItem} className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1197c5]/20 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1197c5] backdrop-blur-md dark:bg-white/10"><motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="inline-grid"><Droplets className="size-3.5" /></motion.span> Nuestro origen <span className="relative flex size-1.5"><motion.span className="absolute inline-flex size-full rounded-full bg-[#1197c5]" animate={{ scale: [1, 2.4], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} /><span className="relative inline-flex size-1.5 rounded-full bg-[#1197c5]" /></span></motion.p>
          <motion.h2 variants={origenItem} className="font-serif text-5xl leading-[1.05] tracking-tight [perspective:600px] md:text-7xl">El agua que nace en el <motion.span className="inline-block bg-gradient-to-r from-[#0e7fb5] via-[#1197c5] to-[#56c7f2] bg-clip-text italic text-transparent" style={{ backgroundSize: '300% 100%' }} animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], y: [0, -5, 0] }} transition={{ backgroundPosition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}>manantial</motion.span></motion.h2>
          <motion.p variants={origenItem} className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">El agua mineral Elite nace en un manantial protegido en el corazón de Anzoátegui, Venezuela. Filtrada por capas naturales de roca y minerales, <span className="relative inline-block font-semibold text-[#0e7fb5]"><motion.span className="absolute -inset-x-1 -inset-y-0.5 -skew-x-6 rounded bg-gradient-to-r from-[#1197c5]/15 to-[#56c7f2]/25" initial={{ scaleX: 0, opacity: 0 }} whileInView={{ scaleX: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }} /><motion.span className="relative inline-block" animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>brota pura y equilibrada</motion.span></span> para acompañar cada mesa y cada momento de tu día.</motion.p>
          <motion.div variants={origenItem} className="mt-10 flex flex-wrap justify-center gap-3">
            {[['Purificada', '100% natural'], ['Envasada en origen', 'Frescura garantizada'], ['Minerales naturales', 'Equilibrio y sabor']].map(([title, sub]) => <motion.div key={title} variants={chipVariants} whileHover={{ y: -4, scale: 1.03, boxShadow: '0 12px 28px rgba(17,151,197,0.18)' }} transition={spring} className="flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/60 px-5 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0b2531]/80"><motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} className="grid place-items-center"><Droplet className="size-4 shrink-0 text-[#1197c5]" /></motion.span><div><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-xs text-muted-foreground">{sub}</p></div></motion.div>)}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
    <section id="contacto" className="border-y border-border bg-[#98e5ff] px-5 py-14 pb-28 dark:bg-[#0a2430] md:px-10 md:py-20"><div className="mx-auto max-w-7xl">
      <div className="mb-10 grid gap-6 md:grid-cols-[.7fr_1fr] md:items-end"><div><p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Encuéntranos</p><h2 className="font-serif text-3xl leading-tight md:text-5xl">Agua Elite,<br />cerca de ti.</h2></div><p className="max-w-3xl font-serif text-2xl leading-tight md:text-4xl">Cada botella conserva la historia del lugar donde nace.</p></div>
      <motion.div variants={contactContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-5 md:grid-cols-3">
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
    </div></section>
    <footer className="bg-primary px-5 py-10 text-primary-foreground md:px-10"><Reveal><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
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
      <div className="flex flex-col items-center gap-1.5 md:items-end">
        <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} Agua Elite · Todos los derechos reservados</p>
        <p className="text-xs text-primary-foreground/70">Desarrollada por <a href="https://www.instagram.com/ferriohtv" target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-primary-foreground/40 underline-offset-2 transition-colors hover:decoration-primary-foreground">Fernando Centeno</a></p>
      </div>
    </div>
    </Reveal></footer>
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-background/95 px-4 py-3 text-[10px] font-semibold text-muted-foreground shadow-[0_-8px_24px_rgba(8,45,100,.08)] backdrop-blur md:hidden" aria-label="Navegación principal">
      <motion.a href="#inicio" className="flex flex-col items-center gap-1 text-primary" whileTap={{ scale: 0.9 }}><Droplets className="size-5" /> Inicio</motion.a>
      <motion.a href="#catalogo" className="flex flex-col items-center gap-1" whileTap={{ scale: 0.9 }}><Grid2X2 className="size-5" /> Tienda</motion.a>
      <motion.button onClick={() => setCartOpen(true)} whileTap={{ scale: 0.9 }} className="relative flex flex-col items-center gap-1"><ShoppingBag className="size-5" /> Cesta{count > 0 && <AnimatePresence initial={false}><motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="absolute -right-2 -top-1 grid size-4 place-items-center rounded-full bg-[#e30613] text-[9px] text-white">{count}</motion.span></AnimatePresence>}</motion.button>
      {isAuthenticated && user ? <motion.button onClick={openProfile} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1"><UserRound className="size-5" /> Perfil</motion.button> : null}
      <motion.a href="#contacto" className="flex flex-col items-center gap-1" whileTap={{ scale: 0.9 }}><Mail className="size-5" /> Contacto</motion.a>
    </nav>
    <motion.button aria-label="Abrir asistente" onClick={() => setChatOpen(!chatOpen)} whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.85 }} className="fixed bottom-24 right-3 z-20 grid size-14 touch-none cursor-grab place-items-center rounded-full bg-[#1197c5] text-white shadow-xl active:cursor-grabbing">
      <motion.span className="absolute inset-0 rounded-full bg-[#1197c5]/40" animate={{ scale: [1, 1.45], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
      <motion.span className="relative grid place-items-center" animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }} transition={{ rotate: { duration: 2.5, repeat: Infinity, repeatDelay: 1 }, y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }}><Droplets className="size-7" /></motion.span>
    </motion.button>
    <AnimatePresence>
      {chatOpen && <motion.section initial={{ opacity: 0, y: 32, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.92 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="fixed bottom-32 right-4 z-40 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-[0_24px_70px_rgba(8,45,100,.28)]" aria-label="Asistente de manantial">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1197c5] via-[#0e7fb5] to-primary p-5 pb-7 text-primary-foreground">
          <motion.span className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-white/10" animate={{ scale: [1, 1.2, 1], x: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.span className="pointer-events-none absolute -bottom-14 left-6 size-28 rounded-full bg-white/5" animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="relative flex items-center gap-3">
            <motion.img src="/elite-logo.jpg" alt="Logo Elite" className="size-12 rounded-full border-2 border-white/50 object-cover shadow-lg" animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.07, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="min-w-0"><motion.p className="font-serif text-xl leading-tight" animate={{ opacity: [1, 0.75, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>Bienvenido</motion.p><p className="text-xs text-primary-foreground/80">Te puedo ayudar a elegir tu agua</p></div>
            <motion.button onClick={() => setChatOpen(false)} whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring} className="ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25" aria-label="Cerrar asistente"><X className="size-4" /></motion.button>
          </div>
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 320, damping: 24 }} className="relative mt-4 flex justify-start">
            <p className="max-w-[85%] rounded-[1.6rem] rounded-bl-lg bg-white px-4 py-2.5 text-xs leading-5 text-primary shadow-md">¡Hola! Soy el asistente de Agua Elite. ¿Qué agua buscas hoy?</p>
          </motion.div>
        </div>
        <div className="flex max-h-56 flex-col gap-3 overflow-y-auto p-4"><AnimatePresence initial={false}>{messages.map((message: { id: string; role: string; parts: Array<{ type: string; text?: string }> }) => <motion.p key={message.id} layout initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }} className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-5 ${message.role === 'user' ? 'ml-auto rounded-[1.2rem] rounded-br-md bg-secondary text-foreground' : 'rounded-[1.2rem] rounded-bl-md border border-border bg-muted'}`}>{message.parts.filter((part) => part.type === 'text').map((part) => part.type === 'text' ? part.text : '').join('')}</motion.p>)}</AnimatePresence></div>
        <div className="flex gap-2 border-t border-border bg-background p-3"><form onSubmit={askAssistant} className="flex min-w-0 flex-1 gap-2 rounded-full border border-border bg-background py-1 pl-4 pr-1"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Escribe tu pregunta" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /><motion.button type="submit" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.85 }} disabled={status === 'streaming' || status === 'submitted'} aria-label="Enviar pregunta" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1197c5] text-white disabled:opacity-50"><Send className="size-4" /></motion.button></form></div>
        <div className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-background/80 py-2 text-[10px] font-medium tracking-wide text-muted-foreground"><GeminiIcon className="size-3.5 text-[#8b5cf6]" /> Tecnología Google Gemini</div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>
      {selected && <motion.div role="dialog" aria-modal="true" aria-label={`Detalle de ${selected.title}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 p-0 md:items-center md:p-6" onClick={() => setSelected(null)}>
        <motion.div initial={{ y: 60, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="grid max-h-[90vh] w-full max-w-4xl overflow-auto bg-background md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
          <div className="relative aspect-square bg-gradient-to-b from-[#dff6ff] via-[#eafaff] to-[#f7feff] md:aspect-auto"><motion.img src={selected.featuredImage?.url || '/placeholder.jpg'} alt={selected.featuredImage?.altText || selected.title} className="size-full object-cover mix-blend-multiply" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} /></div>
          <div className="flex flex-col gap-8 p-7 md:p-10"><motion.button aria-label="Cerrar detalle" onClick={() => setSelected(null)} whileHover={{ rotate: 90 }} transition={spring} className="ml-auto text-muted-foreground"><X className="size-5" /></motion.button><div><p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{selected.productType || 'Agua mineral'}</p><h2 className="font-serif text-4xl tracking-tight">{selected.title}</h2><p className="mt-6 leading-7 text-muted-foreground">{selected.description}</p></div><div className="mt-auto flex items-center justify-between border-t border-border pt-6"><p className="text-lg font-medium">{formatPrice(selected.priceRange.minVariantPrice.amount, selected.priceRange.minVariantPrice.currencyCode)}</p><motion.button onClick={() => addToCart(selected)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} className="rounded-full bg-[#e30613] px-5 py-3 text-sm font-medium text-white">Añadir a la cesta</motion.button></div></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {profileOpen && <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/40 p-4 md:items-center" onClick={() => setProfileOpen(false)}>
        <motion.form onSubmit={saveProfile} initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 24 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Cuenta · {user?.email || 'Usuario'}</p><h2 className="text-2xl font-extrabold text-primary">Mi cuenta</h2></div><motion.button type="button" whileHover={{ rotate: 90 }} transition={spring} onClick={() => setProfileOpen(false)} aria-label="Cerrar formulario"><X className="size-5" /></motion.button></div>
          <div className="mb-4 flex gap-1 rounded-full bg-secondary p-1 text-xs font-semibold">
            <button type="button" onClick={() => setProfileView('info')} className={`flex-1 rounded-full px-3 py-2 transition-colors ${profileView === 'info' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}>Mi información</button>
            <button type="button" onClick={() => setProfileView('orders')} className={`flex-1 rounded-full px-3 py-2 transition-colors ${profileView === 'orders' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}>Mis pedidos ({userOrders.length})</button>
          </div>
          {profileView === 'orders' ? (
            <div className="flex max-h-[55vh] flex-col gap-2.5 overflow-y-auto pr-1">
              {ordersLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Cargando tus pedidos...</p>
              ) : userOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                  <Package className="size-8 text-muted-foreground/60" />
                  <p className="text-sm font-semibold">Aún no tienes pedidos</p>
                  <p className="text-xs text-muted-foreground">Cuando confirmes una compra aparecerá aquí con su número de ticket y podrás ver su estatus.</p>
                </div>
              ) : (
                userOrders.map((order) => {
                  const statusMeta = getOrderStatusMeta(order.status)
                  return (
                    <div key={order.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 font-bold text-primary"><Ticket className="size-4 text-[#e30613]" /> {order.ticket_number || 'Sin ticket'}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusMeta.badge}`}>{statusMeta.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('es-VE')}</p>
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <p key={index} className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{item.product?.title || 'Producto'}</span><span className="shrink-0 font-semibold">x{item.quantity ?? 1}</span></p>
                          ))}
                          {order.items.length > 3 && <p className="text-[11px] text-muted-foreground/70">+{order.items.length - 3} más</p>}
                        </div>
                      )}
                      <p className="mt-2 border-t border-border pt-2 text-sm font-semibold text-primary">Total: {formatPrice(String(order.total_price || 0), order.currency)}</p>
                    </div>
                  )
                })
              )}
            </div>
          ) : profileSaved ? (
            <div className="py-8 text-center"><p className="font-serif text-2xl text-emerald-600">¡Información guardada!</p><p className="mt-2 text-sm text-muted-foreground">Tus datos quedaron registrados en el panel de Elite para futuros pedidos.</p><button type="button" onClick={() => { setProfileView('info'); setProfileSaved(false) }} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Entendido</button></div>
          ) : (
            <>
              <div className="grid gap-3">
                {[['full_name', 'Nombre completo', 'text'], ['phone', 'Número de teléfono', 'tel'], ['city', 'Ciudad', 'text'], ['address', 'Dirección de entrega', 'text'], ['id_number', 'Cédula', 'text']].map(([field, placeholder, type]) => <motion.input key={field} required={field === 'full_name' || field === 'phone'} type={type} placeholder={placeholder} value={profile[field as keyof typeof profile]} onChange={(event) => setProfile({ ...profile, [field]: event.target.value })} whileFocus={{ scale: 1.02, borderColor: '#e30613' }} className="rounded-xl border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-[#e30613]" />)}
              </div>
              <motion.button disabled={savingProfile} type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#1197c5] px-5 py-3.5 font-bold text-white disabled:opacity-60">{savingProfile ? 'Guardando...' : 'Guardar mi información'} <ArrowRight className="size-4" /></motion.button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Esta información se guarda en Supabase y se muestra en el panel administrativo de Elite.</p>
            </>
          )}
        </motion.form>
      </motion.div>}
    </AnimatePresence>
    <AnimatePresence>
      {orderOpen && <motion.div role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-primary/40 p-4 md:items-center" onClick={() => setOrderOpen(false)}>
        <motion.form onSubmit={submitOrderAndWhatsApp} initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 24 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Pedido con tu cuenta</p><h2 className="text-2xl font-extrabold text-primary">Completa tus datos</h2></div><motion.button type="button" whileHover={{ rotate: 90 }} transition={spring} onClick={() => setOrderOpen(false)} aria-label="Cerrar formulario"><X className="size-5" /></motion.button></div>
          {orderSuccess ? (
            <div className="py-8 text-center"><p className="font-serif text-2xl text-emerald-600">¡Pedido registrado con éxito!</p>{lastOrderTicket && <p className="mt-3 text-sm text-muted-foreground">Tu número de pedido es <strong className="text-[#e30613]">{lastOrderTicket}</strong>. Guárdalo para rastrear el estatus en <strong className="text-primary">Mi perfil → Mis pedidos</strong>.</p>}<p className="mt-3 text-sm text-muted-foreground">Se abrió WhatsApp para coordinar la entrega con el vendedor.</p><button type="button" onClick={() => { setOrderOpen(false); setOrderSuccess(false) }} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Entendido</button></div>
          ) : (
            <>
              {user?.email && <p className="mb-3 text-xs text-muted-foreground">Autenticado como: <strong className="text-primary">{user.email}</strong></p>}
              <div className="grid gap-3">
                {[['name', 'Nombre completo', 'text'], ['city', 'Ciudad', 'text'], ['id', 'Cédula', 'text'], ['phone', 'Número de teléfono', 'text'], ['quantity', 'Cantidad total de aguas', 'number']].map(([field, placeholder, type]) => <motion.input key={field} required type={type} min={type === 'number' ? '1' : undefined} placeholder={placeholder} value={order[field as keyof typeof order]} onChange={(event) => setOrder({ ...order, [field]: event.target.value })} whileFocus={{ scale: 1.02, borderColor: '#e30613' }} className="rounded-xl border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-[#e30613]" />)}
              </div>
              <motion.button disabled={savingOrder} type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3.5 font-bold text-white disabled:opacity-60">{savingOrder ? 'Guardando en Supabase...' : 'Confirmar compra y WhatsApp'} <ArrowRight className="size-4" /></motion.button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Tus datos quedan guardados en nuestra base de datos segura de Supabase.</p>
            </>
          )}
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
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#dff6ff] to-[#f7feff]"><motion.img src={item.product.featuredImage?.url || '/placeholder.jpg'} alt="" className="size-full object-cover mix-blend-multiply" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} /></div>
              <div className="min-w-0 flex-1"><h3 className="font-serif text-lg">{item.product.title}</h3><p className="text-sm text-muted-foreground">{formatPrice(item.product.priceRange.minVariantPrice.amount, item.product.priceRange.minVariantPrice.currencyCode)}</p><div className="mt-3 flex items-center gap-3"><motion.button whileTap={{ scale: 0.8 }} onClick={() => changeQuantity(item.product.id, -1)} aria-label="Reducir cantidad" className="border border-border p-1"><Minus className="size-3" /></motion.button><span className="text-sm">{item.quantity}</span><motion.button whileTap={{ scale: 0.8 }} onClick={() => changeQuantity(item.product.id, 1)} aria-label="Aumentar cantidad" className="border border-border p-1"><Plus className="size-3" /></motion.button><motion.button whileTap={{ scale: 0.8 }} onClick={() => setCart((items) => items.filter((cartItem) => cartItem.product.id !== item.product.id))} aria-label="Eliminar producto" className="ml-auto text-muted-foreground"><Trash2 className="size-4" /></motion.button></div></div>
            </motion.div>)}</AnimatePresence></div>
            <div className="border-t border-border p-5">
              <div className="mb-4 flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><strong>{formatPrice(subtotal.toFixed(2), currency)}</strong></div>
              <div className="mb-3 rounded-xl bg-[#1197c5]/10 p-3 text-xs text-[#1197c5]">
                {isAuthenticated ? 'Con tu cuenta Gmail puedes proceder con la compra' : '🔒 Debes estar registrado o iniciar sesión para procesar la compra'}
              </div>
              <motion.button onClick={checkout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="flex w-full items-center justify-center gap-2 bg-[#e30613] px-5 py-4 text-sm font-bold text-white shadow-lg">Proceder a Comprar {isAuthenticated ? <ArrowRight className="size-4" /> : <LogIn className="size-4" />}</motion.button>
            </div>
          </>}
        </motion.aside>
      </>}
    </AnimatePresence>
  </main>
}
