import { ORDERS_KEY, refreshOrders, type Order } from '../data/orders'

/** Default for kitchen / admin lists. */
export const POLL_DEFAULT_MS = 8000
/** Lounge ticket — status bar + ready toast should feel live. */
export const POLL_LIVE_MS = 3500

/** Poll shared orders — pauses when tab hidden, refreshes on focus. */
export function startOrdersPoll(
  onUpdate: (orders: Order[]) => void,
  intervalMs = POLL_DEFAULT_MS,
): () => void {
  let timer: number | null = null

  const tick = () => {
    if (document.hidden) return
    void refreshOrders().then(onUpdate)
  }

  const schedule = () => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      tick()
      schedule()
    }, intervalMs)
  }

  tick()
  schedule()

  const onVisible = () => {
    if (!document.hidden) tick()
  }
  const onFocus = () => tick()
  const onStorage = (event: StorageEvent) => {
    if (event.key === ORDERS_KEY || event.key === null) {
      void refreshOrders().then(onUpdate)
    }
  }

  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', onFocus)
  window.addEventListener('storage', onStorage)

  return () => {
    if (timer) window.clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', onFocus)
    window.removeEventListener('storage', onStorage)
  }
}
