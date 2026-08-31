import type { StoreId } from './budget'
import type { WrapDesign } from './wrapDesign'

export type OrderStatus = 'neu' | 'in_arbeit' | 'fertig'
export type OrderSource = 'customer' | 'admin'

export type OrderItem = {
  store: StoreId
  name: string
  packs: number
  subtotal: number
  storeLabel: string
}

export type OrderCustomer = {
  name: string
  email: string
  phone: string
  when: string
  note: string
}

export type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  source?: OrderSource
  customer: OrderCustomer
  portions: number
  store: StoreId | 'all'
  total: number
  items: OrderItem[]
  nutFree: boolean
  wrapDesign?: WrapDesign
}

export const ORDERS_KEY = 'wraaap-orders'
export const ORDERS_EVENT = 'wraaap-orders-changed'

const API_ROOT = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || ''
export const ORDERS_API = `${API_ROOT}/api/orders`

export const STATUS_LABEL: Record<OrderStatus, string> = {
  neu: 'Neu',
  in_arbeit: 'In Arbeit',
  fertig: 'Fertig',
}

function normalize(orders: Order[]): Order[] {
  return orders.map((order) => ({
    ...order,
    status: order.status || 'neu',
    customer: order.customer || {
      name: '',
      email: '',
      phone: '',
      when: '',
      note: '',
    },
    items: order.items || [],
  }))
}

function localLoad(): Order[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
    if (!Array.isArray(raw)) return []
    return normalize(raw)
  } catch {
    return []
  }
}

function localSave(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 40)))
}

function emit() {
  window.dispatchEvent(new Event(ORDERS_EVENT))
}

function cache(orders: Order[]) {
  const next = normalize(orders).slice(0, 40)
  localSave(next)
  emit()
  return next
}

/** Sync cache (may be stale). Prefer refreshOrders() for kitchen/admin. */
export function loadOrders(): Order[] {
  return localLoad()
}

export async function refreshOrders(): Promise<Order[]> {
  try {
    const res = await fetch(ORDERS_API, { cache: 'no-store' })
    if (res.ok) return cache((await res.json()) as Order[])
  } catch {
    /* API offline — local only */
  }
  return localLoad()
}

export async function addOrder(order: Order): Promise<Order[]> {
  try {
    const res = await fetch(ORDERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    if (res.ok) return cache((await res.json()) as Order[])
  } catch {
    /* fall through */
  }
  return cache([order, ...localLoad().filter((item) => item.id !== order.id)])
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order[]> {
  try {
    const res = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) return cache((await res.json()) as Order[])
  } catch {
    /* fall through */
  }
  return cache(localLoad().map((order) => (order.id === id ? { ...order, status } : order)))
}

export async function removeOrder(id: string): Promise<Order[]> {
  try {
    const res = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) return cache((await res.json()) as Order[])
  } catch {
    /* fall through */
  }
  return cache(localLoad().filter((order) => order.id !== id))
}

export async function clearFinishedOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${ORDERS_API}/clear-finished`, { method: 'POST' })
    if (res.ok) return cache((await res.json()) as Order[])
  } catch {
    /* fall through */
  }
  return cache(localLoad().filter((order) => order.status !== 'fertig'))
}

export function saveOrders(orders: Order[]) {
  cache(orders)
}

export function formatOrderTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
