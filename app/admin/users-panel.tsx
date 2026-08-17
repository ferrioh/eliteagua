'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AtSign, Building2, ChevronDown, Fingerprint, Mail, MapPin, Package, Phone, UserRound, Users } from 'lucide-react'
import { getOrderStatusMeta, type OrderRow } from '@/lib/orders'

type ProfileRow = {
  id: string
  created_at: string
  updated_at: string
  auth0_user_id: string
  email: string
  full_name: string
  phone: string
  city: string
  address: string
  id_number: string
}

export function UsersPanel() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  const loadProfiles = useCallback(() => {
    fetch('/api/profile')
      .then((response) => response.json())
      .then((json) => setProfiles(json.profiles ?? []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  const loadOrders = useCallback(() => {
    fetch('/api/orders')
      .then((response) => response.json())
      .then((json) => setOrders(json.orders ?? []))
      .catch(() => setOrders([]))
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const ordersByEmail = useMemo(() => {
    const map = new Map<string, OrderRow[]>()
    for (const order of orders) {
      const email = order.auth0_user_email || ''
      if (!email) continue
      const list = map.get(email) ?? []
      list.push(order)
      map.set(email, list)
    }
    return map
  }, [orders])

  return (
    <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#1197c5]/10 text-[#1197c5]"><Users className="size-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Supabase · Usuarios con cuenta Gmail</p>
            <h2 className="font-serif text-2xl text-primary">Información de usuarios registrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Perfiles creados cuando un cliente inicia sesión con su cuenta de Google/Gmail y completa sus datos. Toca cada usuario para desplegar su información.</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{profiles.length} usuarios</span>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Cargando perfiles...</p>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <UserRound className="size-10 text-muted-foreground/60" />
          <p className="font-serif text-xl">Aún no hay usuarios con cuenta registrada.</p>
          <p className="max-w-md text-sm text-muted-foreground">Cuando un cliente inicie sesión con su correo de Gmail y guarde su información, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {profiles.map((profile, index) => {
            const isOpen = openId === profile.id
            const userOrders = ordersByEmail.get(profile.email) ?? []
            const latestOrder = userOrders[0]
            return (
              <motion.div key={profile.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-xl border border-border bg-background">
                <button
                  onClick={() => setOpenId(isOpen ? null : profile.id)}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
                  aria-expanded={isOpen}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1197c5] to-[#0e7fb5] text-xs font-bold text-white">#{index + 1}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"><UserRound className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-primary">{profile.full_name || 'Sin nombre'}</span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail className="size-3 shrink-0" /> {profile.email || 'Sin correo'}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">Registrado {new Date(profile.created_at).toLocaleDateString('es-VE')}</span>
                  {userOrders.length > 0 && (
                    <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground sm:inline-flex">
                      <Package className="size-3.5 text-[#1197c5]" />
                      {userOrders.length} pedido{userOrders.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"><ChevronDown className="size-4" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
                      <div className="grid gap-2 border-t border-border px-4 py-4 text-sm text-muted-foreground sm:grid-cols-2">
                        {profile.phone && <p className="flex items-center gap-2"><Phone className="size-3.5 shrink-0 text-emerald-600" /> {profile.phone}</p>}
                        {profile.city && <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-[#1197c5]" /> {profile.city}</p>}
                        {profile.address && <p className="flex items-center gap-2"><Building2 className="size-3.5 shrink-0 text-[#1197c5]" /> {profile.address}</p>}
                        {profile.id_number && <p className="flex items-center gap-2"><Fingerprint className="size-3.5 shrink-0 text-[#1197c5]" /> Cédula: {profile.id_number}</p>}
                        {profile.auth0_user_id && <p className="flex items-center gap-2 truncate"><AtSign className="size-3.5 shrink-0 text-muted-foreground/60" /> <span className="truncate" title={profile.auth0_user_id}>{profile.auth0_user_id}</span></p>}
                        <p className="flex items-center gap-2 sm:col-span-2"><Mail className="size-3.5 shrink-0 text-muted-foreground/60" /> Actualizado: {new Date(profile.updated_at).toLocaleDateString('es-VE')}</p>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Package className="size-3.5 shrink-0 text-[#1197c5]" /> Pedidos realizados ({userOrders.length})</p>
                          {userOrders.length === 0 ? (
                            <p className="text-xs text-muted-foreground/70">Este usuario aún no ha realizado pedidos.</p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {latestOrder && (
                                <p className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-bold text-primary">{latestOrder.ticket_number || 'Sin ticket'}</span>
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getOrderStatusMeta(latestOrder.status).badge}`}>{getOrderStatusMeta(latestOrder.status).label}</span>
                                  <span className="text-xs text-muted-foreground">· {new Date(latestOrder.created_at).toLocaleDateString('es-VE')}</span>
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">Toca el ticket en la pestaña «Pedidos» para cambiar su estatus.</p>
                            </div>
                          )}
                        </div>
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