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

export const STATUS_LABEL: Record<OrderStatus, string> = {
  neu: 'Neu',
  in_arbeit: 'In Arbeit',
  fertig: 'Fertig',
}

export function loadOrders(): Order[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[]
    if (!Array.isArray(raw)) return []
    return raw.map((order) => ({
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
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 40)))
  window.dispatchEvent(new Event(ORDERS_EVENT))
}

export function addOrder(order: Order) {
  const next = [order, ...loadOrders()].slice(0, 40)
  saveOrders(next)
  return next
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const next = loadOrders().map((order) =>
    order.id === id ? { ...order, status } : order,
  )
  saveOrders(next)
  return next
}

export function removeOrder(id: string) {
  const next = loadOrders().filter((order) => order.id !== id)
  saveOrders(next)
  return next
}

export function clearFinishedOrders() {
  const next = loadOrders().filter((order) => order.status !== 'fertig')
  saveOrders(next)
  return next
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
