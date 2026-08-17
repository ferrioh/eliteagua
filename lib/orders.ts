export type OrderStatus = 'registrada' | 'en proceso' | 'pagado'

export const ORDER_STATUSES: Array<{ value: OrderStatus; label: string; badge: string }> = [
  { value: 'registrada', label: 'Registrada', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  { value: 'en proceso', label: 'En proceso', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'pagado', label: 'Pagado', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
]

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((status) => status.value)

export function getOrderStatusMeta(status?: string | null) {
  const fallback: { value: OrderStatus; label: string; badge: string } = { value: 'registrada', label: 'Registrada', badge: 'bg-sky-100 text-sky-700' }
  return ORDER_STATUSES.find((item) => item.value === status) ?? fallback
}

export type OrderRow = {
  id: string
  ticket_number?: string | null
  created_at: string
  customer_name: string
  customer_city: string
  customer_id_number: string
  customer_phone: string
  quantity: number
  total_price: number
  currency: string
  status: string
  items: Array<{ product?: { title?: string }; quantity?: number }>
  auth0_user_email?: string | null
  auth0_user_id?: string | null
}