export type GatedPortal = 'kueche' | 'admin'

function storageKey(portal: GatedPortal) {
  return `wraaap-auth-${portal}`
}

export function isPortalUnlocked(portal: GatedPortal): boolean {
  try {
    return sessionStorage.getItem(storageKey(portal)) === '1'
  } catch {
    return false
  }
}

export function setPortalUnlocked(portal: GatedPortal, unlocked: boolean) {
  try {
    if (unlocked) sessionStorage.setItem(storageKey(portal), '1')
    else sessionStorage.removeItem(storageKey(portal))
  } catch {
    /* ignore */
  }
}
