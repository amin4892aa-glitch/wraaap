import type { Order } from '../data/orders'
import { money } from '../data/budget'

export function orderToReceipt(order: Order) {
  const designItems =
    order.wrapDesign?.layerLabels.map((label) => ({
      name: label.slice(0, 28),
      price: 0,
    })) || []

  const shopItems = order.items.map((item) => ({
    name: `${item.packs}× ${item.name}`.slice(0, 28),
    price: Number(item.subtotal.toFixed(2)),
  }))

  const items = designItems.length ? designItems : shopItems

  if (order.customer.note) {
    items.push({ name: `Notiz: ${order.customer.note}`.slice(0, 28), price: 0 })
  }

  return {
    type: 'receipt' as const,
    store: 'WRAAAP KÜCHE',
    address: order.customer.name || 'Gast',
    items,
    taxRate: 0,
    barcode: true,
    timestamp: order.createdAt,
    footer: [
      order.wrapDesign ? `Style ${order.wrapDesign.paintLabel}` : null,
      order.nutFree ? 'NUSSALLERGIE!' : null,
      order.customer.when ? `Abholung ${order.customer.when}` : null,
      order.total > 0 ? `${order.portions} Pers. · ${money(order.total)}` : `${order.portions} Pers.`,
      order.id,
    ]
      .filter(Boolean)
      .join(' · '),
  }
}
