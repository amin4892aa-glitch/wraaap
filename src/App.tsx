import { Suspense, lazy, useEffect, useState } from 'react'
import { PortalHub } from './components/PortalHub'
import { PortalGate } from './components/PortalGate'
import { resetWraaapProgress, resetLoungeCardProgress } from './lib/resetWraaapProgress'
import './App.css'

const CustomerPortal = lazy(() =>
  import('./components/CustomerPortal').then((m) => ({ default: m.CustomerPortal })),
)
const KitchenPortal = lazy(() =>
  import('./components/KitchenPortal').then((m) => ({ default: m.KitchenPortal })),
)
const AdminPortal = lazy(() =>
  import('./components/AdminPortal').then((m) => ({ default: m.AdminPortal })),
)
const WaitingLounge = lazy(() =>
  import('./components/WaitingLounge').then((m) => ({ default: m.WaitingLounge })),
)

type Portal = 'hub' | 'customer' | 'kueche' | 'admin' | 'lounge'

const LOUNGE_ORDER_KEY = 'wraaap-lounge-order'

function readPortal(): Portal {
  const hash = window.location.hash.replace('#/', '').replace('#', '')
  if (hash.startsWith('lounge')) return 'lounge'
  if (hash === 'customer' || hash === 'style') return 'customer'
  if (hash === 'kueche' || hash === 'kitchen') return 'kueche'
  if (hash === 'admin' || hash === 'budget') return 'admin'
  if (hash === 'cases' || hash.startsWith('cases/')) return 'lounge'
  return 'hub'
}

function readLoungeOrderId(): string | null {
  const hash = window.location.hash.replace('#/', '').replace('#', '')
  const parts = hash.split('/')
  if (parts[0] === 'lounge' && parts[1]) return decodeURIComponent(parts[1])
  return sessionStorage.getItem(LOUNGE_ORDER_KEY)
}

function App() {
  const [portal, setPortal] = useState<Portal>(() => readPortal())
  const [loungeOrderId, setLoungeOrderId] = useState<string | null>(() => readLoungeOrderId())

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '')
    if (hash === 'reset-cards' || hash === 'reset-cards/') {
      resetLoungeCardProgress()
      window.location.hash = '#/lounge'
      window.location.reload()
      return
    }
    if (hash === 'reset' || hash === 'reset/') {
      resetWraaapProgress()
      window.location.hash = '#/'
      window.location.reload()
    }
  }, [])

  useEffect(() => {
    const onHash = () => {
      setPortal(readPortal())
      setLoungeOrderId(readLoungeOrderId())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(next: Portal, orderId?: string) {
    if (next === 'lounge' && orderId) {
      sessionStorage.setItem(LOUNGE_ORDER_KEY, orderId)
      window.location.hash = `#/lounge/${encodeURIComponent(orderId)}`
      setLoungeOrderId(orderId)
      setPortal('lounge')
      return
    }
    const map = {
      hub: '#/',
      customer: '#/customer',
      kueche: '#/kueche',
      admin: '#/admin',
      lounge: loungeOrderId
        ? `#/lounge/${encodeURIComponent(loungeOrderId)}`
        : '#/lounge',
    } as const
    window.location.hash = map[next]
    setPortal(next)
  }

  return (
    <div className={`page page-${portal}`}>
      {portal === 'hub' && (
        <PortalHub
          onOpen={(id) => go(id)}
          onLounge={() => go('lounge')}
        />
      )}

      {portal === 'customer' && (
        <Suspense fallback={<div className="style-boot">… Customer …</div>}>
          <CustomerPortal
            onHome={() => go('hub')}
            onLounge={(orderId) => go('lounge', orderId)}
          />
        </Suspense>
      )}

      {portal === 'lounge' && (
        <Suspense fallback={<div className="style-boot">… Lounge …</div>}>
          <WaitingLounge
            orderId={loungeOrderId}
            onHome={() => go('hub')}
            onOrderAgain={() => go('customer')}
          />
        </Suspense>
      )}

      {portal === 'kueche' && (
        <PortalGate
          portal="kueche"
          title="Kitchen"
          hint="Staff only. Password required for tickets."
          password="kueche"
          onHome={() => go('hub')}
        >
          <Suspense fallback={<div className="style-boot">… Küche …</div>}>
            <KitchenPortal onHome={() => go('hub')} />
          </Suspense>
        </PortalGate>
      )}

      {portal === 'admin' && (
        <PortalGate
          portal="admin"
          title="Admin"
          hint="Internal ops only. No customer ordering here."
          password="admin"
          onHome={() => go('hub')}
        >
          <Suspense fallback={<div className="style-boot">… Admin …</div>}>
            <AdminPortal onHome={() => go('hub')} />
          </Suspense>
        </PortalGate>
      )}
    </div>
  )
}

export default App
