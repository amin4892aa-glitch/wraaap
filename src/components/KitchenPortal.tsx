import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import {
  ORDERS_EVENT,
  ORDERS_KEY,
  clearFinishedOrders,
  refreshOrders,
  removeOrder,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from '../data/orders'
import './KitchenPortal.css'

const OrderTicket3D = lazy(() =>
  import('./OrderTicket3D').then((m) => ({ default: m.OrderTicket3D })),
)

type Filter = 'alle' | OrderStatus

type Props = {
  onHome: () => void
}

export function KitchenPortal({ onHome }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('alle')

  useEffect(() => {
    const refresh = () => {
      void refreshOrders().then(setOrders)
    }
    refresh()
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY || event.key === null) refresh()
    }
    window.addEventListener(ORDERS_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    const timer = window.setInterval(refresh, 2000)
    return () => {
      window.removeEventListener(ORDERS_EVENT, refresh)
      window.removeEventListener('storage', onStorage)
      window.clearInterval(timer)
    }
  }, [])

  const visible = useMemo(() => {
    const list = filter === 'alle' ? orders : orders.filter((order) => order.status === filter)
    return list.slice(0, 6)
  }, [orders, filter])

  const hiddenCount = useMemo(() => {
    const list = filter === 'alle' ? orders : orders.filter((order) => order.status === filter)
    return Math.max(0, list.length - 6)
  }, [orders, filter])

  const counts = useMemo(
    () => ({
      neu: orders.filter((o) => o.status === 'neu').length,
      in_arbeit: orders.filter((o) => o.status === 'in_arbeit').length,
      fertig: orders.filter((o) => o.status === 'fertig').length,
    }),
    [orders],
  )

  return (
    <div className="kitchen">
      <header className="kitchen-chrome">
        <button type="button" onClick={onHome}>
          WRAAAP ©2026
        </button>
        <span>Kitchen</span>
        <button type="button" onClick={onHome}>
          Portals
        </button>
      </header>

      <div className="kitchen-shell">
        <header className="kitchen-head">
          <div>
            <p className="kitchen-kicker">02 · Kitchen line</p>
            <h1>
              Open
              <em> tickets.</em>
            </h1>
            <p className="kitchen-lede">
              Customer designs and admin orders land here as paper. Stamp the status, clear the
              board.
            </p>
          </div>
          <div className="kitchen-stats">
            <span>
              <strong>{counts.neu}</strong>
              <em>new</em>
            </span>
            <span>
              <strong>{counts.in_arbeit}</strong>
              <em>working</em>
            </span>
            <span>
              <strong>{counts.fertig}</strong>
              <em>done</em>
            </span>
          </div>
        </header>

        <div className="kitchen-toolbar">
          {(
            [
              ['alle', 'All'],
              ['neu', 'New'],
              ['in_arbeit', 'Working'],
              ['fertig', 'Done'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`kitchen-chip ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="kitchen-chip danger"
            onClick={() => {
              void clearFinishedOrders().then(setOrders)
            }}
            disabled={!counts.fertig}
          >
            Clear done
          </button>
        </div>

        {!visible.length && (
          <p className="kitchen-empty">
            Empty line. When a customer sends a wrap, the ticket appears here.
          </p>
        )}

        {hiddenCount > 0 && (
          <p className="kitchen-more">Showing latest 6 · {hiddenCount} more waiting</p>
        )}

        <div className="ticket-board ticket-board-3d">
          <Suspense fallback={<p className="kitchen-empty">Printing tickets…</p>}>
            {visible.map((order) => (
              <OrderTicket3D
                key={order.id}
                order={order}
                onStatus={(status) => {
                  void updateOrderStatus(order.id, status).then(setOrders)
                }}
                onRemove={() => {
                  void removeOrder(order.id).then(setOrders)
                }}
              />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
