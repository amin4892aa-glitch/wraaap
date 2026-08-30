/** Wipe all persisted WRAAAP client state (chips, cards, promos, orders…). */
export function resetWraaapProgress() {
  if (typeof window === 'undefined') return

  const localKeys = [
    'wraaap-chips',
    'wraaap-promos-used',
    'wraaap-card-inventory',
    'wraaap-cosmetics-owned',
    'wraaap-cosmetics-equip',
    'wraaap-achievements',
    'wraaap-orders',
  ]

  for (const key of localKeys) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }

  try {
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('wraaap-')) doomed.push(k)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }

  try {
    const sessionDoomed: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith('wraaap-')) sessionDoomed.push(k)
    }
    sessionDoomed.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    /* ignore */
  }

  window.dispatchEvent(new Event('wraaap-cards-changed'))
  window.dispatchEvent(new Event('wraaap-cosmetics-changed'))
  window.dispatchEvent(new Event('wraaap-achievements-changed'))
  window.dispatchEvent(new Event('wraaap-orders-changed'))
}

/** Lounge cards / aura collection only — keeps chips, promos, orders. */
export function resetLoungeCardProgress() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('wraaap-card-inventory')
    localStorage.removeItem('wraaap-achievements')
  } catch {
    /* ignore */
  }
  try {
    document.documentElement.classList.remove('ach-wrap-cursor')
    document.documentElement.style.removeProperty('--wrap-cursor')
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('wraaap-cards-changed'))
  window.dispatchEvent(new Event('wraaap-achievements-changed'))
}
