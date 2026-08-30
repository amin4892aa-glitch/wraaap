import { useEffect, useMemo, useState } from 'react'
import { money } from '../data/budget'
import {
  ORDERS_EVENT,
  ORDERS_KEY,
  STATUS_LABEL,
  formatOrderTime,
  loadOrders,
  type Order,
} from '../data/orders'
import { BudgetPlanner } from './BudgetPlanner'
import './AdminPortal.css'

type Props = {
  onHome: () => void
}

export function AdminPortal({ onHome }: Props) {
  const [orders, setOrders] = useState<Order[]>(() => loadOrders())
  const [tab, setTab] = useState<'overview' | 'budget'>('overview')

  useEffect(() => {
    const refresh = () => setOrders(loadOrders())
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY || event.key === null) refresh()
    }
    window.addEventListener(ORDERS_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    const timer = window.setInterval(refresh, 2500)
    return () => {
      window.removeEventListener(ORDERS_EVENT, refresh)
      window.removeEventListener('storage', onStorage)
      window.clearInterval(timer)
    }
  }, [])

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    return {
      total: orders.length,
      neu: orders.filter((o) => o.status === 'neu').length,
      work: orders.filter((o) => o.status === 'in_arbeit').length,
      customer: orders.filter((o) => o.source === 'customer').length,
      revenue,
    }
  }, [orders])

  return (
    <div className="admin">
      <header className="admin-chrome">
        <button type="button" onClick={onHome}>
          WRAAAP ©2026
        </button>
        <span>Admin</span>
        <nav className="admin-tabs">
          <button
            type="button"
            className={tab === 'overview' ? 'active' : ''}
            onClick={() => setTab('overview')}
          >
            Orders
          </button>
          <button
            type="button"
            className={tab === 'budget' ? 'active' : ''}
            onClick={() => setTab('budget')}
          >
            Budget
          </button>
          <button type="button" onClick={onHome}>
            Portals
          </button>
        </nav>
      </header>

      {tab === 'overview' ? (
        <main className="admin-main">
          <section className="admin-hero">
            <p className="admin-kicker">03 · Operations</p>
            <h1>
              Numbers
              <em> & prices.</em>
            </h1>
            <p>Internal only — ledger, design traffic, shopping budget.</p>
          </section>

          <div className="admin-stats">
            <article>
              <span>Orders</span>
              <strong>{stats.total}</strong>
            </article>
            <article>
              <span>New</span>
              <strong>{stats.neu}</strong>
            </article>
            <article>
              <span>Working</span>
              <strong>{stats.work}</strong>
            </article>
            <article>
              <span>Customer designs</span>
              <strong>{stats.customer}</strong>
            </article>
            <article>
              <span>Budget total</span>
              <strong>{money(stats.revenue)}</strong>
            </article>
          </div>

          <section className="admin-table-wrap">
            <h2>All orders</h2>
            {!orders.length && <p className="admin-empty">No orders yet.</p>}
            <div className="admin-table">
              {orders.map((order, index) => (
                <article key={order.id} className="admin-row">
                  <span className="admin-row-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <strong>{order.customer.name || 'Unknown'}</strong>
                    <span>
                      {order.id} · {formatOrderTime(order.createdAt)} ·{' '}
                      {order.source === 'customer' ? 'Customer' : 'Admin'}
                    </span>
                  </div>
                  <div className="admin-row-meta">
                    <em>{STATUS_LABEL[order.status]}</em>
                    <strong>{order.total > 0 ? money(order.total) : 'Design'}</strong>
                  </div>
                  {order.wrapDesign && (
                    <p className="admin-design">
                      {order.wrapDesign.paintLabel}: {order.wrapDesign.layerLabels.join(' · ')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="admin-budget">
          <section className="admin-hero admin-hero-compact">
            <p className="admin-kicker">Budget line</p>
            <h1>
              Shop
              <em> list.</em>
            </h1>
          </section>
          <BudgetPlanner allowOrder={false} />
        </main>
      )}
    </div>
  )
}
