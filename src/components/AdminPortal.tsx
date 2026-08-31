import { useEffect, useMemo, useState } from 'react'
import { money } from '../data/budget'
import {
  ORDERS_EVENT,
  ORDERS_KEY,
  STATUS_LABEL,
  formatOrderTime,
  type Order,
} from '../data/orders'
import { PROMO_CODES } from '../data/promoCodes'
import { startOrdersPoll } from '../lib/pollOrders'
import { BudgetPlanner } from './BudgetPlanner'
import './AdminPortal.css'

type Props = {
  onHome: () => void
}

type AdminTab = 'overview' | 'budget' | 'codes'

function promoReward(code: (typeof PROMO_CODES)[number]) {
  if (code.luckBoost) {
    const mins = code.luckBoostMs ? Math.round(code.luckBoostMs / 60000) : 0
    return mins
      ? `${code.luckBoost}× luck · ${mins} min · once`
      : `${code.luckBoost}× luck`
  }
  return 'chips only'
}

export function AdminPortal({ onHome }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<AdminTab>('overview')

  useEffect(() => {
    const refreshLocal = () => {
      void import('../data/orders').then(({ loadOrders }) => setOrders(loadOrders()))
    }
    refreshLocal()
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY || event.key === null) refreshLocal()
    }
    window.addEventListener(ORDERS_EVENT, refreshLocal)
    window.addEventListener('storage', onStorage)
    const stop = startOrdersPoll(setOrders)
    return () => {
      window.removeEventListener(ORDERS_EVENT, refreshLocal)
      window.removeEventListener('storage', onStorage)
      stop()
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
          <button
            type="button"
            className={tab === 'codes' ? 'active' : ''}
            onClick={() => setTab('codes')}
          >
            Codes
          </button>
          <button type="button" onClick={onHome}>
            Portals
          </button>
        </nav>
      </header>

      {tab === 'overview' && (
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
      )}

      {tab === 'budget' && (
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

      {tab === 'codes' && (
        <main className="admin-main">
          <section className="admin-hero">
            <p className="admin-kicker">04 · Lounge</p>
            <h1>
              Promo
              <em> codes.</em>
            </h1>
            <p>Redeem in Wait room. Chips are fake. Edit codes play cutscenes.</p>
          </section>

          <section className="admin-table-wrap">
            <h2>{PROMO_CODES.length} codes</h2>
            <div className="admin-table">
              {PROMO_CODES.map((promo, index) => (
                <article key={promo.code} className="admin-row admin-code-row">
                  <span className="admin-row-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <strong>{promo.code}</strong>
                    <span>{promo.blurb}</span>
                  </div>
                  <div className="admin-row-meta">
                    <em>{promoReward(promo)}</em>
                    <strong>{promo.chips > 0 ? `+${promo.chips}` : '—'}</strong>
                  </div>
                  <p className="admin-design">
                    {promo.replayable ? 'replayable' : 'one-shot'}
                    {promo.luckBoost
                      ? ` · ${promo.luckBoost}× luck${
                          promo.luckBoostMs
                            ? ` · ${Math.round(promo.luckBoostMs / 60000)} min`
                            : ''
                        }`
                      : ''}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
