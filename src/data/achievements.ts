export const ACHIEVEMENTS_KEY = 'wraaap-achievements'
export const ACHIEVEMENTS_EVENT = 'wraaap-achievements-changed'

export type AchievementId = 'wrap-cursor'

export type Achievement = {
  id: AchievementId
  title: string
  blurb: string
  unlockedAt?: string
}

export const ACHIEVEMENT_DEFS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  'wrap-cursor': {
    id: 'wrap-cursor',
    title: 'WRAP CURSOR',
    blurb: 'Collect 3 unique wrap auras. Your pointer becomes a wrap.',
  },
}

export function loadAchievements(): AchievementId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]') as AchievementId[]
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function hasAchievement(id: AchievementId) {
  return loadAchievements().includes(id)
}

export function unlockAchievement(id: AchievementId) {
  const current = loadAchievements()
  if (current.includes(id)) return { unlocked: false, list: current }
  const next = [...current, id]
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(ACHIEVEMENTS_EVENT))
  return { unlocked: true, list: next }
}

/** Custom wrap cursor — clean rolled wrap pointer */
function buildWrapCursorUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <defs>
    <linearGradient id="t" x1="8" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f0d2a8"/>
      <stop offset="0.55" stop-color="#e0b07a"/>
      <stop offset="1" stop-color="#c98d63"/>
    </linearGradient>
  </defs>
  <path d="M7 11c1.2-3.2 6-5.2 12.5-4.4 7 .8 13.2 4.2 14.2 8.4.7 3-1.4 6.2-5.2 8.6l-9.6 6.2c-3.2 2-6.6 1.4-8-1.4C8.2 24.2 5.8 15.4 7 11Z" fill="url(#t)" stroke="#1a1208" stroke-width="2" stroke-linejoin="round"/>
  <path d="M11 14.5c3.2-1.6 9.2-1.8 14.2-.2" stroke="#6f9a45" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M12.2 18.2c2.8.9 7.4 1.2 11.6.2" stroke="#c4232a" stroke-width="2" stroke-linecap="round"/>
  <path d="M13 21.4c2.4.7 6.2.8 9.4.1" stroke="#5a4634" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
  <circle cx="18.5" cy="16.2" r="1.5" fill="#6f9a45" stroke="#1a1208" stroke-width="1"/>
  <circle cx="23.2" cy="17.4" r="1.25" fill="#c4232a" stroke="#1a1208" stroke-width="1"/>
  <path d="M28.5 29.5 33.2 34" stroke="#1a1208" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="34" cy="34.8" r="2.2" fill="#f4efe6" stroke="#1a1208" stroke-width="1.6"/>
</svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 6 8, auto`
}

export const WRAP_CURSOR_URL = buildWrapCursorUrl()

export function applyWrapCursor(enabled: boolean) {
  const root = document.documentElement
  if (enabled) {
    root.classList.add('ach-wrap-cursor')
    root.style.setProperty('--wrap-cursor', WRAP_CURSOR_URL)
  } else {
    root.classList.remove('ach-wrap-cursor')
    root.style.removeProperty('--wrap-cursor')
  }
}

export function syncAchievementCosmetics() {
  applyWrapCursor(hasAchievement('wrap-cursor'))
}
