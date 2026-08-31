export const CHIPS_KEY = 'wraaap-chips'
export const PROMO_USED_KEY = 'wraaap-promos-used'
export const START_CHIPS = 100

export const LUCK_PULLS_KEY = 'wraaap-luck-pulls'
export const LUCK_MULT_KEY = 'wraaap-luck-mult'

export type PromoCode = {
  code: string
  chips: number
  blurb: string
  /** Optional card grant (edit preview) */
  grantCard?: string
  /** Next pull(s) use this luck multiplier (Sol RNG style) */
  luckBoost?: number
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
    blurb: 'next pull 100× luck',
    luckBoost: 100,
    replayable: true,
  },
  {
    code: 'ESPRESSO',
    chips: 25,
    blurb: 'divine AMV edit · replay anytime',
    grantCard: 'espresso-notice',
    replayable: true,
  },
  {
    code: 'HEADLOCK',
    chips: 25,
    blurb: 'legendary lyric AE edit · replay anytime',
    grantCard: 'garden-glow',
    replayable: true,
  },
  {
    code: 'BIRD',
    chips: 25,
    blurb: 'mythic romance AMV edit · replay anytime',
    grantCard: 'classic-myth',
    replayable: true,
  },
  {
    code: 'MAMACITA',
    chips: 25,
    blurb: 'Masha Mamacita AMV · AE shake heat',
    grantCard: 'sunset-omen',
    replayable: true,
  },
  {
    code: 'FOCUSWATER',
    chips: 25,
    blurb: 'Apple motion graphic edit · watermark hold',
    grantCard: 'focus-water',
    replayable: true,
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

export function loadLuckPulls() {
  try {
    const n = Number(localStorage.getItem(LUCK_PULLS_KEY) || '0')
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  } catch {
    return 0
  }
}

export function loadLuckMult() {
  try {
    const n = Number(localStorage.getItem(LUCK_MULT_KEY) || '1')
    return Number.isFinite(n) && n > 1 ? n : 100
  } catch {
    return 100
  }
}

export function saveLuckPulls(count: number, mult = 100) {
  localStorage.setItem(LUCK_PULLS_KEY, String(Math.max(0, Math.floor(count))))
  localStorage.setItem(LUCK_MULT_KEY, String(Math.max(1, Math.floor(mult))))
}

export function addLuckPulls(amount = 1, mult = 100) {
  const next = loadLuckPulls() + amount
  saveLuckPulls(next, mult)
  return next
}

/** Luck multiplier for this pull (1 = normal). Consumes one boosted pull. */
export function consumeLuckBoost() {
  const n = loadLuckPulls()
  if (n <= 0) return 1
  const mult = loadLuckMult()
  saveLuckPulls(n - 1, mult)
  return mult
}

export function redeemPromo(input: string): {
  ok: boolean
  message: string
  chips?: number
  nextBalance?: number
  grantCard?: string
  luckBoost?: number
  luckPulls?: number
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

  let luckPulls = loadLuckPulls()
  if (promo.luckBoost) {
    luckPulls = addLuckPulls(1, promo.luckBoost)
  }

  const locked = promo.luckBoost
    ? `LOCKED IN · ${promo.luckBoost}× luck · ${promo.blurb}`
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
    luckPulls,
  }
}
