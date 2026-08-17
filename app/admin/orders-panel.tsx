'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ClipboardList, MapPin, Package, Phone, Ticket, UserRound } from 'lucide-react'
import { formatPrice } from '@/lib/shopify'
import { getOrderStatusMeta, ORDER_STATUSES, type OrderRow } from '@/lib/orders'

type Props = {
  orders: OrderRow[]
  onChange: () => void
}

export function OrdersPanel({ orders, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo actualizar el estatus.')
      onChange()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar el estatus.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#1197c5]/10 text-[#1197c5]"><ClipboardList className="size-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Supabase · Registro de pedidos</p>
            <h2 className="font-serif text-2xl text-primary">Pedidos de los clientes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cada pedido genera un ticket (ej. ELITE-0001) para rastrearlo. Cambia el estatus a Registrada, En proceso o Pagado.</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{orders.length} pedidos</span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Package className="size-10 text-muted-foreground/60" />
          <p className="font-serif text-xl">Aún no hay pedidos registrados.</p>
          <p className="max-w-md text-sm text-muted-foreground">Cuando un cliente confirme una compra, aquí aparecerá su pedido con su número de ticket.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order, index) => {
            const isOpen = openId === order.id
            const statusMeta = getOrderStatusMeta(order.status)
            return (
              <motion.div key={order.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.5) }} className="overflow-hidden rounded-xl border border-border bg-background">
                <button
                  onClick={() => setOpenId(isOpen ? null : order.id)}
                  className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
                  aria-expanded={isOpen}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1197c5] to-[#0e7fb5] text-xs font-bold text-white">#{index + 1}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"><Ticket className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-primary">{order.ticket_number || 'Sin ticket'}</span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground"><UserRound className="size-3 shrink-0" /> {order.customer_name}</span>
                  </span>
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline-flex ${statusMeta.badge}`}>{statusMeta.label}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground md:block">{new Date(order.created_at).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="hidden shrink-0 font-bold text-primary lg:block">{formatPrice(String(order.total_price || 0), order.currency)}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"><ChevronDown className="size-4" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                      <div className="grid gap-4 border-t border-border px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          {order.customer_phone && <p className="flex items-center gap-2"><Phone className="size-3.5 shrink-0 text-emerald-600" /> {order.customer_phone}</p>}
                          {order.customer_city && <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-[#1197c5]" /> {order.customer_city}</p>}
                          {order.auth0_user_email && <p className="flex items-center gap-2 truncate"><UserRound className="size-3.5 shrink-0 text-[#1197c5]" /> <span className="truncate" title={order.auth0_user_email}>{order.auth0_user_email}</span></p>}
                          <p className="text-xs text-muted-foreground/70">Cantidad total: <strong className="text-primary">{order.quantity}</strong> · Total: <strong className="text-primary">{formatPrice(String(order.total_price || 0), order.currency)}</strong></p>
                        </div>
                        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                          <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                            Estatus de la orden
                            <select
                              value={order.status}
                              disabled={updating === order.id}
                              onChange={(event) => void updateStatus(order.id, event.target.value)}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-primary outline-none ring-primary focus:ring-2 disabled:opacity-50"
                            >
                              {ORDER_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                            </select>
                          </label>
                          <p className="text-xs text-muted-foreground">El cliente ve este estatus en su perfil.</p>
                        </div>
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos</p>
                            {order.items.map((item, itemIndex) => (
                              <p key={itemIndex} className="flex items-center gap-2 text-sm text-foreground">
                                <Package className="size-3.5 shrink-0 text-[#1197c5]" />
                                {item.product?.title || 'Producto'}
                                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">x{item.quantity ?? 1}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}