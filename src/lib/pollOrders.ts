import { refreshOrders, type Order } from '../data/orders'

/** Poll shared orders — slow + paused when tab hidden. */
export function startOrdersPoll(
  onUpdate: (orders: Order[]) => void,
  intervalMs = 15000,
): () => void {
  const tick = () => {
    if (document.hidden) return
    void refreshOrders().then(onUpdate)
  }

  tick()
  const id = window.setInterval(tick, intervalMs)

  const onVisible = () => {
    if (!document.hidden) tick()
  }
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    window.clearInterval(id)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
