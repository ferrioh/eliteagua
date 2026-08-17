'use client'

import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, FileText, ShoppingBag, TrendingDown, TrendingUp, Users, Droplet } from 'lucide-react'
import { formatPrice } from '@/lib/shopify'

type OrderRow = {
  id: string
  created_at: string
  customer_name: string
  customer_city: string
  customer_phone: string
  quantity: number
  total_price: number
  currency: string
  items: Array<{ product: { title: string }; quantity: number }>
  auth0_user_email?: string
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function AnalyticsPanel({ orders }: { orders: OrderRow[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [generating, setGenerating] = useState(false)

  const monthOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = new Date(order.created_at)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }, [orders, year, month])

  const previousMonthOrders = useMemo(() => {
    const prevDate = new Date(year, month - 1, 1)
    return orders.filter((order) => {
      const date = new Date(order.created_at)
      return date.getFullYear() === prevDate.getFullYear() && date.getMonth() === prevDate.getMonth()
    })
  }, [orders, year, month])

  const totalWaters = monthOrders.reduce((acc, order) => acc + (Number(order.quantity) || 1), 0)
  const totalRevenue = monthOrders.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0)
  const uniqueClients = new Set(monthOrders.map((order) => order.customer_phone || order.auth0_user_email)).size
  const orderCount = monthOrders.length

  const prevWaters = previousMonthOrders.reduce((acc, order) => acc + (Number(order.quantity) || 1), 0)
  const prevRevenue = previousMonthOrders.reduce((acc, order) => acc + (Number(order.total_price) || 0), 0)
  const prevClients = new Set(previousMonthOrders.map((order) => order.customer_phone || order.auth0_user_email)).size

  const revenueDelta = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : (totalRevenue > 0 ? 100 : 0)
  const watersDelta = prevWaters > 0 ? Math.round(((totalWaters - prevWaters) / prevWaters) * 100) : (totalWaters > 0 ? 100 : 0)
  const clientsDelta = prevClients > 0 ? Math.round(((uniqueClients - prevClients) / prevClients) * 100) : (uniqueClients > 0 ? 100 : 0)

  const demandByFormat = useMemo(() => {
    const map = new Map<string, number>()
    for (const order of monthOrders) {
      if (Array.isArray(order.items) && order.items.length) {
        for (const item of order.items) {
          const title = item.product?.title || 'Sin formato'
          map.set(title, (map.get(title) || 0) + (Number(item.quantity) || 1))
        }
      } else {
        map.set('Pedido general', (map.get('Pedido general') || 0) + (Number(order.quantity) || 1))
      }
    }
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1
    return [...map.entries()].map(([title, quantity]) => ({ title, quantity, percent: Math.round((quantity / total) * 100) })).sort((a, b) => b.quantity - a.quantity)
  }, [monthOrders])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const ordersByDay = useMemo(() => {
    const map = new Map<number, { count: number; revenue: number }>()
    for (const order of monthOrders) {
      const day = new Date(order.created_at).getDate()
      const current = map.get(day) || { count: 0, revenue: 0 }
      map.set(day, { count: current.count + 1, revenue: current.revenue + (Number(order.total_price) || 0) })
    }
    return map
  }, [monthOrders])

  const bestDay = [...ordersByDay.entries()].sort((a, b) => b[1].count - a[1].count)[0]
  const busiestDay = bestDay ? `${bestDay[0]} de ${MONTHS[month]}` : 'Sin pedidos este mes'
  const avgPerOrder = orderCount > 0 ? totalRevenue / orderCount : 0

  function changeMonth(delta: number) {
    const next = new Date(year, month + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  function exportPdf() {
    setGenerating(true)
    try {
      const doc = new jsPDF()
      const label = `${MONTHS[month]} ${year}`

      doc.setFillColor(227, 6, 19)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.text('Elite · Resumen Mensual', 14, 14)
      doc.setFontSize(11)
      doc.text(label, 14, 22)
      doc.setFontSize(8)
      doc.text(`Generado el ${new Date().toLocaleDateString('es-VE')}`, 14, 28)

      doc.setTextColor(20, 40, 60)
      doc.setFontSize(13)
      doc.text('Métricas principales', 14, 40)
      autoTable(doc, {
        startY: 44,
        head: [['Métrica', 'Valor', 'vs. mes anterior']],
        body: [
          ['Aguas vendidas', `${totalWaters}`, `${watersDelta >= 0 ? '+' : ''}${watersDelta}%`],
          ['Ingresos', formatPrice(String(totalRevenue.toFixed(2)), 'USD'), `${revenueDelta >= 0 ? '+' : ''}${revenueDelta}%`],
          ['Pedidos', `${orderCount}`, ''],
          ['Clientes únicos', `${uniqueClients}`, `${clientsDelta >= 0 ? '+' : ''}${clientsDelta}%`],
          ['Ticket promedio', formatPrice(String(avgPerOrder.toFixed(2)), 'USD'), ''],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [17, 151, 197], textColor: 255 },
        theme: 'striped',
      })

      doc.setFontSize(13)
      doc.text('Demanda por formato', 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12)
      autoTable(doc, {
        startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16,
        head: [['Formato', 'Unidades', '%']],
        body: demandByFormat.length ? demandByFormat.map((format) => [format.title, `${format.quantity}`, `${format.percent}%`]) : [['Sin datos', '0', '0%']],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [17, 151, 197], textColor: 255 },
        theme: 'striped',
      })

      doc.setFontSize(13)
      doc.text('Detalle de pedidos del mes', 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12)
      autoTable(doc, {
        startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16,
        head: [['Fecha', 'Cliente', 'Teléfono', 'Aguas', 'Total']],
        body: monthOrders.map((order) => [
          new Date(order.created_at).toLocaleDateString('es-VE'),
          order.customer_name,
          order.customer_phone,
          `${Number(order.quantity) || 1}`,
          formatPrice(String(Number(order.total_price) || 0), order.currency),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [17, 151, 197], textColor: 255 },
        theme: 'striped',
      })

      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text('Agua Elite · Agua mineral envasada en el manantial', 14, 290)

      doc.save(`resumen-elite-${year}-${String(month + 1).padStart(2, '0')}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-background p-2 shadow-sm">
          <button onClick={() => changeMonth(-1)} aria-label="Mes anterior" className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-primary"><ChevronLeft className="size-4" /></button>
          <div className="flex items-center gap-2 px-2 text-sm font-bold text-primary">
            <CalendarDays className="size-4 text-[#1197c5]" />
            {MONTHS[month]} {year}
          </div>
          <button onClick={() => changeMonth(1)} aria-label="Mes siguiente" className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground hover:text-primary"><ChevronRight className="size-4" /></button>
        </div>
        <button onClick={() => void exportPdf()} disabled={generating || monthOrders.length === 0} className="inline-flex items-center gap-2 rounded-full bg-[#e30613] px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50"><FileText className="size-4" />{generating ? 'Generando...' : 'Exportar resumen del mes (PDF)'}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Droplet className="size-4 text-[#1197c5]" /> Aguas vendidas</div>
          <p className="mt-3 font-serif text-4xl text-primary">{totalWaters}</p>
          <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${watersDelta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{watersDelta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}{watersDelta >= 0 ? '+' : ''}{watersDelta}% vs mes anterior</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><BarChart3 className="size-4 text-[#e30613]" /> Ingresos</div>
          <p className="mt-3 font-serif text-4xl text-[#1197c5]">{formatPrice(String(totalRevenue.toFixed(2)), 'USD')}</p>
          <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${revenueDelta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{revenueDelta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}{revenueDelta >= 0 ? '+' : ''}{revenueDelta}% vs mes anterior</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><ShoppingBag className="size-4 text-emerald-600" /> Pedidos</div>
          <p className="mt-3 font-serif text-4xl text-primary">{orderCount}</p>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">Ticket promedio: <strong className="text-primary">{formatPrice(String(avgPerOrder.toFixed(2)), 'USD')}</strong></p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Users className="size-4 text-[#1197c5]" /> Clientes únicos</div>
          <p className="mt-3 font-serif text-4xl text-primary">{uniqueClients}</p>
          <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${clientsDelta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{clientsDelta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}{clientsDelta >= 0 ? '+' : ''}{clientsDelta}% vs mes anterior</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-primary">Calendario mensual</h3>
            <span className="rounded-full bg-[#1197c5]/10 px-3 py-1 text-xs font-semibold text-[#1197c5]">Día con más pedidos: {busiestDay}</span>
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, index) => <div key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const data = ordersByDay.get(day)
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const intensity = data ? Math.min(1, data.count / (bestDay?.[1].count || 1)) : 0
              return (
                <div key={day} className={`flex min-h-16 flex-col rounded-xl border p-1.5 ${data ? 'bg-[#1197c5]' : 'border-border bg-secondary/40'} ${isToday ? 'ring-2 ring-[#e30613]' : ''}`} style={data ? { opacity: 0.45 + intensity * 0.55 } : undefined}>
                  <span className={`text-xs font-bold ${data ? 'text-white' : 'text-muted-foreground'}`}>{day}</span>
                  {data && <div className="mt-auto"><p className="text-[10px] font-bold leading-tight text-white">{data.count} pedido{data.count !== 1 ? 's' : ''}</p><p className="text-[9px] font-semibold leading-tight text-white/80">{formatPrice(String(data.revenue.toFixed(0)), 'USD')}</p></div>}
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-background p-6 shadow-sm lg:p-8">
          <h3 className="font-serif text-xl text-primary">Análisis de demanda por formato</h3>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Distribución de unidades vendidas según presentación.</p>
          {demandByFormat.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">No hay ventas registradas en {MONTHS[month]}.</p>
          ) : (
            <div className="grid gap-4">
              {demandByFormat.map((format, index) => (
                <div key={format.title}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{format.title}</span>
                    <strong className="text-[#1197c5]">{format.percent}%</strong>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${index === 0 ? 'bg-[#1197c5]' : index === 1 ? 'bg-primary' : 'bg-[#e30613]'}`} style={{ width: `${format.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{format.quantity} unidades</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
