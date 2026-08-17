'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const client = createClient()
    if (!client) {
      setLoading(false)
      setError('Autenticación no configurada.')
      return
    }
    const { error: authError } = await client.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return <main className="grid min-h-screen place-items-center bg-[#edf8fd] px-5 py-10"><div className="w-full max-w-md rounded-[2rem] bg-background p-7 shadow-xl"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> Volver a Elite</Link><div className="mb-8 flex items-center gap-3"><img src="/elite-logo.jpg" alt="Elite" className="size-14 rounded-full object-cover" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Panel privado</p><h1 className="text-2xl font-extrabold text-primary">Acceso administrativo</h1></div></div><form onSubmit={handleSubmit} className="flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-semibold">Correo electrónico<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Contraseña<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2" /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<button disabled={loading} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#e30613] px-5 py-3.5 font-bold text-white disabled:opacity-60"><LockKeyhole className="size-4" />{loading ? 'Validando...' : 'Entrar al panel'}</button></form></div></main>
}
