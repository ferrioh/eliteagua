'use client'

import { useCallback, useEffect, useState } from 'react'
import { AtSign, Building2, Fingerprint, Mail, MapPin, Phone, UserRound, Users } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  const loadProfiles = useCallback(() => {
    fetch('/api/profile')
      .then((response) => response.json())
      .then((json) => setProfiles(json.profiles ?? []))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  return (
    <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#1197c5]/10 text-[#1197c5]"><Users className="size-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Supabase · Usuarios con cuenta Gmail</p>
            <h2 className="font-serif text-2xl text-primary">Información de usuarios registrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Perfiles creados cuando un cliente inicia sesión con su cuenta de Google/Gmail y completa sus datos.</p>
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1197c5] to-[#0e7fb5] text-white"><UserRound className="size-5" /></span>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-primary">{profile.full_name || 'Sin nombre'}</h3>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail className="size-3 shrink-0" /> {profile.email || 'Sin correo'}</p>
                </div>
              </div>
              <div className="grid gap-2 text-xs text-muted-foreground">
                {profile.phone && <p className="flex items-center gap-2"><Phone className="size-3.5 shrink-0 text-emerald-600" /> {profile.phone}</p>}
                {profile.city && <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-[#1197c5]" /> {profile.city}</p>}
                {profile.address && <p className="flex items-center gap-2"><Building2 className="size-3.5 shrink-0 text-[#1197c5]" /> {profile.address}</p>}
                {profile.id_number && <p className="flex items-center gap-2"><Fingerprint className="size-3.5 shrink-0 text-[#1197c5]" /> Cédula: {profile.id_number}</p>}
                {profile.auth0_user_id && <p className="flex items-center gap-2 truncate"><AtSign className="size-3.5 shrink-0 text-muted-foreground/60" /> <span className="truncate" title={profile.auth0_user_id}>{profile.auth0_user_id}</span></p>}
              </div>
              <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">Registrado: {new Date(profile.created_at).toLocaleDateString('es-VE')} · Actualizado: {new Date(profile.updated_at).toLocaleDateString('es-VE')}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
