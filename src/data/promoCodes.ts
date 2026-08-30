export const CHIPS_KEY = 'wraaap-chips'
export const PROMO_USED_KEY = 'wraaap-promos-used'
export const START_CHIPS = 100

export type PromoCode = {
  code: string
  chips: number
  blurb: string
  /** Optional card grant (edit preview) */
  grantCard?: string
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

export function redeemPromo(input: string): {
  ok: boolean
  message: string
  chips?: number
  nextBalance?: number
  grantCard?: string
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
    balance += promo.chips
    saveChips(balance)
    saveUsedPromos([...used, code])
  }

  return {
    ok: true,
    message: already
      ? `replay · ${promo.blurb}`
      : `+${gained} · ${promo.blurb}`,
    chips: gained,
    nextBalance: balance,
    grantCard: promo.grantCard,
  }
}
