import { STATUS_LABEL, formatOrderTime, type Order, type OrderStatus } from '../data/orders'
import { OrderProgressBar } from './OrderProgressBar'
import './OrderTicket3D.css'

type Props = {
  order: Order
  onStatus: (status: OrderStatus) => void
  onRemove: () => void
}

export function OrderTicket3D({ order, onStatus, onRemove }: Props) {
  const lines =
    order.wrapDesign?.layerLabels?.length
      ? order.wrapDesign.layerLabels
      : order.items.map((item) => `${item.packs}× ${item.name}`)

  const shortId = order.id.replace('WRAAAP-', '#')

  return (
    <article className={`ticket status-${order.status}`}>
      <div className="ticket-pin" aria-hidden />
      <div className="ticket-paper">
        <header className="ticket-head">
          <div>
            <p className="ticket-store">WRAAAP · KÜCHE</p>
            <h2>{order.customer.name || 'Gast'}</h2>
          </div>
          <span className={`ticket-stamp ${order.status}`}>{STATUS_LABEL[order.status]}</span>
        </header>

        <p className="ticket-meta">
          {shortId} · {formatOrderTime(order.createdAt)}
          {order.customer.when ? ` · Abholung ${order.customer.when}` : ''}
        </p>

        <OrderProgressBar status={order.status} variant="kitchen" />

        {order.wrapDesign && (
          <p className="ticket-style">
            Style <strong>{order.wrapDesign.paintLabel}</strong>
          </p>
        )}

        {order.nutFree && <p className="ticket-allergy">⚠ NUSSALLERGIE</p>}

        <ul className="ticket-lines">
          {lines.map((line) => (
            <li key={line}>
              <span className="ticket-box" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {order.customer.note && (
          <p className="ticket-note">
            <em>Notiz</em>
            {order.customer.note}
          </p>
        )}

        <footer className="ticket-foot">
          <span>{order.portions} Pers.</span>
          <span>{order.source === 'customer' ? 'Customer' : 'Admin'}</span>
        </footer>
      </div>

      <div className="ticket-bar">
        <div className="ticket-actions">
          {(
            [
              ['neu', 'Neu'],
              ['in_arbeit', 'Arbeit'],
              ['fertig', 'Fertig'],
            ] as const
          ).map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={order.status === status ? 'on' : ''}
              onClick={() => onStatus(status)}
            >
              {label}
            </button>
          ))}
          <button type="button" className="trash" onClick={onRemove}>
            Weg
          </button>
        </div>
      </div>
    </article>
  )
}
