export const CHIPS_KEY = 'wraaap-chips'
export const PROMO_USED_KEY = 'wraaap-promos-used'
export const START_CHIPS = 100

export const LUCK_UNTIL_KEY = 'wraaap-luck-until'
export const LUCK_MULT_KEY = 'wraaap-luck-mult'

export type PromoCode = {
  code: string
  chips: number
  blurb: string
  /** Optional card grant (edit preview) */
  grantCard?: string
  /** Active luck multiplier while timer runs (Sol RNG style) */
  luckBoost?: number
  /** How long luckBoost lasts, in ms */
  luckBoostMs?: number
  /** Can redeem again — replays cutscene, chips only once */
  replayable?: boolean
}

/** Fake-cash codes — school lounge only, no real money */
export const PROMO_CODES: PromoCode[] = [
  { code: 'WRAAAP', chips: 50, blurb: 'house welcome pack' },
  { code: 'SAMBAL', chips: 75, blurb: 'heat bonus' },
  { code: 'ALDI', chips: 40, blurb: 'budget kings' },
  { code: 'PUTTE', chips: 60, blurb: 'protein stash' },
  { code: 'AVOCADO', chips: 80, blurb: 'green gold drip' },
  { code: 'NOIR', chips: 100, blurb: 'shadow bankroll' },
  { code: 'MYTHIC', chips: 150, blurb: 'aura funding' },
  { code: 'KUECHE', chips: 55, blurb: 'staff tip jar' },
  { code: 'FREEWRAP', chips: 120, blurb: 'afternoon special' },
  { code: 'BANDIT', chips: 90, blurb: 'one-arm funding' },
  { code: 'SOLRNG', chips: 200, blurb: 'sol edit cash' },
  { code: 'TIKTOK', chips: 110, blurb: 'cutscene money' },
  {
    code: 'EDIT',
    chips: 25,
    blurb: '10× luck for 5 minutes · once',
    luckBoost: 10,
    luckBoostMs: 5 * 60 * 1000,
  },
  {
    code: 'ESPRESSO',
    chips: 25,
    blurb: 'divine tip jar',
  },
  {
    code: 'HEADLOCK',
    chips: 25,
    blurb: 'legendary tip jar',
  },
  {
    code: 'BIRD',
    chips: 25,
    blurb: 'mythic tip jar',
  },
  {
    code: 'MAMACITA',
    chips: 25,
    blurb: 'mamacita tip jar',
  },
  {
    code: 'FOCUSWATER',
    chips: 25,
    blurb: 'focus tip jar',
  },
]

export function loadChips() {
  try {
    const raw = localStorage.getItem(CHIPS_KEY)
    if (raw == null) return START_CHIPS
    const n = Number(raw)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : START_CHIPS
  } catch {
    return START_CHIPS
  }
}

export function saveChips(amount: number) {
  localStorage.setItem(CHIPS_KEY, String(Math.max(0, Math.floor(amount))))
}

export function loadUsedPromos(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PROMO_USED_KEY) || '[]') as string[]
    return Array.isArray(raw) ? raw.map((c) => c.toUpperCase()) : []
  } catch {
    return []
  }
}

export function saveUsedPromos(codes: string[]) {
  localStorage.setItem(PROMO_USED_KEY, JSON.stringify(codes))
}

function clearLuck() {
  try {
    localStorage.removeItem(LUCK_UNTIL_KEY)
    localStorage.removeItem(LUCK_MULT_KEY)
    // legacy pull-based luck
    localStorage.removeItem('wraaap-luck-pulls')
  } catch {
    /* ignore */
  }
}

export function activateLuckBoost(mult: number, durationMs: number) {
  const until = Date.now() + Math.max(0, durationMs)
  localStorage.setItem(LUCK_UNTIL_KEY, String(until))
  localStorage.setItem(LUCK_MULT_KEY, String(Math.max(1, Math.floor(mult))))
  localStorage.removeItem('wraaap-luck-pulls')
  return until
}

/** Active timed luck — expires automatically. Does not consume on pull. */
export function getActiveLuck(): { mult: number; remainingMs: number; until: number } {
  try {
    const until = Number(localStorage.getItem(LUCK_UNTIL_KEY) || '0')
    const mult = Number(localStorage.getItem(LUCK_MULT_KEY) || '1')
    const remainingMs = until - Date.now()
    if (!Number.isFinite(until) || remainingMs <= 0) {
      if (until) clearLuck()
      return { mult: 1, remainingMs: 0, until: 0 }
    }
    return {
      mult: Number.isFinite(mult) && mult > 1 ? Math.floor(mult) : 1,
      remainingMs,
      until,
    }
  } catch {
    return { mult: 1, remainingMs: 0, until: 0 }
  }
}

/** Luck multiplier for this pull (1 = normal). Timed buff, not per-pull. */
export function peekLuckBoost() {
  return getActiveLuck().mult
}

export function formatLuckRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function redeemPromo(input: string): {
  ok: boolean
  message: string
  chips?: number
  nextBalance?: number
  grantCard?: string
  luckBoost?: number
  luckUntil?: number
  luckRemainingMs?: number
} {
  const code = input.trim().toUpperCase().replace(/\s+/g, '')
  if (!code) return { ok: false, message: 'enter a code' }

  const promo = PROMO_CODES.find((row) => row.code === code)
  if (!promo) return { ok: false, message: 'invalid code' }

  const used = loadUsedPromos()
  const already = used.includes(code)

  if (already && !promo.replayable) {
    return { ok: false, message: 'already redeemed' }
  }

  // chips only on first redeem
  let balance = loadChips()
  let gained = 0
  if (!already) {
    gained = promo.chips
    if (gained) {
      balance += promo.chips
      saveChips(balance)
    }
    saveUsedPromos([...used, code])
  }

  let luckUntil = 0
  let luckRemainingMs = 0
  if (promo.luckBoost && promo.luckBoostMs) {
    luckUntil = activateLuckBoost(promo.luckBoost, promo.luckBoostMs)
    luckRemainingMs = Math.max(0, luckUntil - Date.now())
  }

  const locked = promo.luckBoost && promo.luckBoostMs
    ? `LOCKED IN · ${promo.luckBoost}× luck · ${Math.round(promo.luckBoostMs / 60000)} min`
    : already
      ? `replay · ${promo.blurb}`
      : gained
        ? `+${gained} · ${promo.blurb}`
        : promo.blurb

  return {
    ok: true,
    message: locked,
    chips: gained,
    nextBalance: balance,
    grantCard: promo.grantCard,
    luckBoost: promo.luckBoost,
    luckUntil,
    luckRemainingMs,
  }
}
