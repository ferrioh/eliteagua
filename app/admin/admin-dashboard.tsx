'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronUp, ImagePlus, Images, Link2, LogOut, Package, Pencil, Plus, Share2, Trash2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/shopify'
import type { CustomProductRow } from '@/lib/products'
import type { SlideRow } from '@/lib/slides'
import type { SiteSettings } from '@/lib/settings'

const emptyForm = { title: '', description: '', price: '', currency_code: 'USD', tags: '', product_type: 'Agua mineral', image_url: '' }
const inputClass = 'rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2'

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter()
  const [products, setProducts] = useState<CustomProductRow[]>([])
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [slides, setSlides] = useState<SlideRow[]>([])
  const [slideFile, setSlideFile] = useState<File | null>(null)
  const [slidePreview, setSlidePreview] = useState('')
  const [addingSlide, setAddingSlide] = useState(false)
  const [movingSlide, setMovingSlide] = useState<string | null>(null)
  const [deletingSlide, setDeletingSlide] = useState<string | null>(null)
  const [social, setSocial] = useState<SiteSettings>({ instagram_url: '', facebook_url: '', x_url: '' })
  const [savingSocial, setSavingSocial] = useState(false)
  const [socialStatus, setSocialStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products')
      const json = await response.json()
      setProducts(json.products ?? [])
    } catch {
      setProducts([])
    }
  }, [])

  useEffect(() => { void loadProducts() }, [loadProducts])

  const loadSlides = useCallback(async () => {
    try {
      const response = await fetch('/api/slides')
      const json = await response.json()
      setSlides(json.slides ?? [])
    } catch {
      setSlides([])
    }
  }, [])

  useEffect(() => { void loadSlides() }, [loadSlides])

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings')
      const json = await response.json()
      setSocial({ instagram_url: json.settings?.instagram_url ?? '', facebook_url: json.settings?.facebook_url ?? '', x_url: json.settings?.x_url ?? '' })
    } catch {
      setSocial({ instagram_url: '', facebook_url: '', x_url: '' })
    }
  }, [])

  useEffect(() => { void loadSettings() }, [loadSettings])

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingSocial(true)
    setSocialStatus(null)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(social),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudieron guardar las redes sociales.')
      setSocialStatus({ type: 'success', message: 'Redes sociales actualizadas. Revisa el pie de la página.' })
    } catch (error) {
      setSocialStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setSavingSocial(false)
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = form.title.trim()
    const description = form.description.trim()
    const price = Number(form.price)
    const tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    if (!title || !Number.isFinite(price) || price < 0) {
      setStatus({ type: 'error', message: 'El nombre y un precio válido son obligatorios.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      let imageUrl = form.image_url.trim() || null
      if (file) {
        const supabase = createClient()
        if (!supabase) throw new Error('Supabase no está configurado.')
        const extension = file.name.split('.').pop() || 'png'
        const path = `images/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
        if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`)
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }
      const response = await fetch(editing ? `/api/products/${editing}` : '/api/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, price, currency_code: form.currency_code, image_url: imageUrl, tags, product_type: form.product_type }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo guardar el producto.')
      setForm(emptyForm)
      setFile(null)
      setPreview('')
      setEditing(null)
      setStatus({ type: 'success', message: editing ? `"${title}" se actualizó correctamente.` : `"${title}" se agregó al catálogo.` })
      void loadProducts()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return
    setDeleting(id)
    setStatus(null)
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo eliminar el producto.')
      setStatus({ type: 'success', message: 'Producto eliminado.' })
      void loadProducts()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setDeleting(null)
    }
  }

  function startEdit(product: CustomProductRow) {
    setEditing(product.id)
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      currency_code: product.currency_code,
      tags: (product.tags ?? []).join(', '),
      product_type: product.product_type ?? 'Agua mineral',
      image_url: product.image_url ?? '',
    })
    setFile(null)
    setPreview('')
    setStatus(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyForm)
    setFile(null)
    setPreview('')
    setStatus(null)
  }

  async function handleLogout() {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  async function addSlide() {
    if (!slideFile) return
    setAddingSlide(true)
    setStatus(null)
    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase no está configurado.')
      const extension = slideFile.name.split('.').pop() || 'png'
      const path = `slides/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('slide-images').upload(path, slideFile)
      if (uploadError) throw new Error(`No se pudo subir la imagen: ${uploadError.message}`)
      const imageUrl = supabase.storage.from('slide-images').getPublicUrl(path).data.publicUrl
      const response = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo agregar la imagen.')
      setSlideFile(null)
      setSlidePreview('')
      setStatus({ type: 'success', message: 'Imagen agregada al slider del inicio.' })
      void loadSlides()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setAddingSlide(false)
    }
  }

  async function moveSlide(id: string, direction: 'up' | 'down') {
    setMovingSlide(id)
    setStatus(null)
    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo mover la imagen.')
      void loadSlides()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setMovingSlide(null)
    }
  }

  async function deleteSlide(id: string) {
    if (!window.confirm('¿Eliminar esta imagen del slider?')) return
    setDeletingSlide(id)
    setStatus(null)
    try {
      const response = await fetch(`/api/slides/${id}`, { method: 'DELETE' })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error ?? 'No se pudo eliminar la imagen.')
      setStatus({ type: 'success', message: 'Imagen eliminada del slider.' })
      void loadSlides()
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Error inesperado.' })
    } finally {
      setDeletingSlide(null)
    }
  }

  return <main className="min-h-screen bg-[#edf8fd] px-5 py-10">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" /> Volver a Elite</a>
        <button onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground"><LogOut className="size-4" /> Cerrar sesión</button>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <img src="/elite-logo.jpg" alt="Elite" className="size-14 rounded-full object-cover" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Elite · Administración</p>
          <h1 className="font-serif text-4xl tracking-tight text-primary">Gestionar catálogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sesión activa: {email}</p>
        </div>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-background p-5 shadow-sm"><p className="text-sm text-muted-foreground">Productos publicados</p><p className="mt-2 font-serif text-3xl">{products.length}</p></div>
        <div className="rounded-2xl bg-background p-5 shadow-sm"><p className="text-sm text-muted-foreground">Sesión activa</p><p className="mt-2 truncate font-bold">{email}</p></div>
        <div className="rounded-2xl bg-background p-5 shadow-sm"><p className="text-sm text-muted-foreground">Pedidos</p><p className="mt-2 font-bold">Recepción por WhatsApp</p></div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">{editing ? <Pencil className="size-5" /> : <Plus className="size-5" />}</span>
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">{editing ? 'Editar producto' : 'Nuevo producto'}</p><h2 className="font-serif text-2xl text-primary">{editing ? 'Actualizar agua mineral' : 'Agregar agua mineral'}</h2></div>
            {editing && <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive"><X className="size-3.5" /> Cancelar</button>}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold">Nombre del producto<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ej. Elite 600 ML" className={inputClass} /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">Descripción<textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Caja de 16 unidades. Agua mineral Elite..." className={`${inputClass} resize-none`} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">Precio (USD)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="12.00" className={inputClass} /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold">Moneda<select value={form.currency_code} onChange={(event) => setForm({ ...form, currency_code: event.target.value })} className={inputClass}><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold">Etiquetas<small className="font-normal text-muted-foreground">Separadas por comas.</small><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="600 ML, Caja 16 unidades" className={inputClass} /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">Tipo<select value={form.product_type} onChange={(event) => setForm({ ...form, product_type: event.target.value })} className={inputClass}><option value="Agua mineral">Agua mineral</option><option value="Pack">Pack</option></select></label>
            <div className="flex flex-col gap-2 text-sm font-semibold">
              Foto del producto
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center text-sm font-normal text-muted-foreground hover:border-primary">
                <ImagePlus className="size-6 text-primary" />
                {file ? file.name : 'Sube una foto desde tu equipo'}
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
              {preview && <img src={preview} alt="Vista previa" className="h-40 w-full rounded-xl object-cover" />}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" /></div>
            <label className="flex flex-col gap-2 text-sm font-semibold">O pega una URL de imagen<small className="font-normal text-muted-foreground">Ej. https://.../elite-600ml.png</small><div className="relative"><Link2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={form.image_url} onChange={(event) => { setForm({ ...form, image_url: event.target.value }); setFile(null); setPreview(form.image_url) }} placeholder="https://..." className={`${inputClass} w-full pl-11`} /></div></label>
            {status && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-destructive'}`}>{status.message}</p>}
            <button disabled={saving} className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#e30613] px-5 py-3.5 font-bold text-white disabled:opacity-60"><Upload className="size-4" />{saving ? 'Guardando...' : editing ? 'Actualizar producto' : 'Publicar en el catálogo'}</button>
          </form>
        </section>
        <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"><Package className="size-5" /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Catálogo</p><h2 className="font-serif text-2xl text-primary">Productos actuales</h2></div>
          </div>
          {products.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground"><Package className="size-8 text-muted-foreground/60" />Aún no hay productos. Agrega el primero con el formulario.</div> : <ul className="flex flex-col gap-3">{products.map((product) => <li key={product.id} className="flex items-center gap-4 rounded-xl border border-border bg-background p-3"><div className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary"><img src={product.image_url || '/placeholder.jpg'} alt={product.title} className="size-full object-cover mix-blend-multiply" /></div><div className="min-w-0 flex-1"><h3 className="truncate font-serif text-lg">{product.title}</h3><p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>{product.tags.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1.5">{product.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{tag}</span>)}</div>}</div><div className="flex shrink-0 flex-col items-end gap-2"><p className="font-bold text-primary">{formatPrice(String(product.price), product.currency_code)}</p><div className="flex items-center gap-1.5"><button onClick={() => startEdit(product)} aria-label={`Editar ${product.title}`} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary"><Pencil className="size-4" /></button><button onClick={() => void handleDelete(product.id)} disabled={deleting === product.id} aria-label={`Eliminar ${product.title}`} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="size-4" /></button></div></div></li>)}</ul>}
        </section>
      </div>
      <section className="mt-8 rounded-2xl bg-background p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"><Images className="size-5" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Portada</p><h2 className="font-serif text-2xl text-primary">Slider del inicio</h2><p className="mt-1 text-sm text-muted-foreground">Las imágenes que se ven rotando al abrir la página. Puedes cambiar el orden, eliminar o agregar más.</p></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide, index) => <div key={slide.id} className="overflow-hidden rounded-xl border border-border bg-background"><div className="relative aspect-[16/9] bg-secondary"><img src={slide.image_url} alt={`Slide ${index + 1}`} className="size-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-primary">Slide {index + 1}</span></div><div className="flex items-center justify-between gap-2 p-3"><div className="flex items-center gap-1"><button onClick={() => void moveSlide(slide.id, 'up')} disabled={movingSlide === slide.id || index === 0} aria-label={`Mover slide ${index + 1} hacia arriba`} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary disabled:opacity-30"><ChevronUp className="size-4" /></button><button onClick={() => void moveSlide(slide.id, 'down')} disabled={movingSlide === slide.id || index === slides.length - 1} aria-label={`Mover slide ${index + 1} hacia abajo`} className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary disabled:opacity-30"><ChevronDown className="size-4" /></button></div><button onClick={() => void deleteSlide(slide.id)} disabled={deletingSlide === slide.id} aria-label={`Eliminar slide ${index + 1}`} className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive disabled:opacity-50"><Trash2 className="size-4" /></button></div></div>)}
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background p-6 text-center">
            <ImagePlus className="size-8 text-primary" />
            <div className="text-sm font-semibold">Agregar imagen</div>
            {slidePreview ? <><img src={slidePreview} alt="Vista previa del slide" className="aspect-[16/9] w-full rounded-lg object-cover" /><button onClick={() => void addSlide()} disabled={addingSlide} className="w-full rounded-full bg-[#e30613] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{addingSlide ? 'Subiendo...' : 'Subir al slider'}</button><button onClick={() => { setSlideFile(null); setSlidePreview('') }} className="text-xs text-muted-foreground underline">Cancelar</button></> : <><label className="cursor-pointer text-xs font-semibold text-primary underline">Elegir archivo<input type="file" accept="image/*" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) { setSlideFile(selected); setSlidePreview(URL.createObjectURL(selected)) } }} className="hidden" /></label><p className="text-xs text-muted-foreground">Recomendado: formato ancho (1920×1080 o similar)</p></>}
          </div>
        </div>
      </section>
      <section className="mt-8 rounded-2xl bg-background p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"><Share2 className="size-5" /></span>
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e30613]">Pie de página</p><h2 className="font-serif text-2xl text-primary">Redes sociales</h2><p className="mt-1 text-sm text-muted-foreground">Los enlaces se muestran como iconos en el pie de la página. Deja vacío lo que no quieras mostrar.</p></div>
        </div>
        <form onSubmit={saveSettings} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-semibold">Instagram<input value={social.instagram_url} onChange={(event) => setSocial({ ...social, instagram_url: event.target.value })} placeholder="https://instagram.com/elite" className={inputClass} /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">Facebook<input value={social.facebook_url} onChange={(event) => setSocial({ ...social, facebook_url: event.target.value })} placeholder="https://facebook.com/elite" className={inputClass} /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">X (Twitter)<input value={social.x_url} onChange={(event) => setSocial({ ...social, x_url: event.target.value })} placeholder="https://x.com/elite" className={inputClass} /></label>
          </div>
          {socialStatus && <p role="status" className={`rounded-xl px-4 py-3 text-sm ${socialStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-destructive'}`}>{socialStatus.message}</p>}
          <button disabled={savingSocial} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e30613] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Share2 className="size-4" />{savingSocial ? 'Guardando...' : 'Guardar enlaces'}</button>
        </form>
      </section>
    </div>
  </main>
}