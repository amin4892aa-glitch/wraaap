export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine'

export type DropCard = {
  id: string
  name: string
  blurb: string
  rarity: CardRarity
  /** Image path under /public — swap when user photos arrive */
  art: string
  /** Chance weight among same-rarity pool */
  weight: number
  /** wrap auras count toward Wrap Cursor achievement */
  kind?: 'wrap' | 'ingredient'
}

export const RARITY_META: Record<
  CardRarity,
  { label: string; color: string; glow: string; chanceLabel: string }
> = {
  common: {
    label: 'COMMON',
    color: '#9aa0a6',
    glow: 'rgba(154,160,166,0.45)',
    chanceLabel: '1/2',
  },
  uncommon: {
    label: 'UNCOMMON',
    color: '#3dd68c',
    glow: 'rgba(61,214,140,0.45)',
    chanceLabel: '1/4',
  },
  rare: {
    label: 'RARE',
    color: '#4da3ff',
    glow: 'rgba(77,163,255,0.5)',
    chanceLabel: '1/12',
  },
  epic: {
    label: 'EPIC',
    color: '#b388ff',
    glow: 'rgba(179,136,255,0.55)',
    chanceLabel: '1/40',
  },
  legendary: {
    label: 'LEGENDARY',
    color: '#ffb020',
    glow: 'rgba(255,176,32,0.6)',
    chanceLabel: '1/120',
  },
  mythic: {
    label: 'MYTHIC',
    color: '#ff4d6d',
    glow: 'rgba(255,77,109,0.7)',
    chanceLabel: '1/400',
  },
  divine: {
    label: 'DIVINE',
    color: '#ff8fb8',
    glow: 'rgba(255,143,184,0.85)',
    chanceLabel: '1/2500',
  },
}

/**
 * Drop table — art paths are placeholders until you send photos.
 * Put files in public/cards/ and update `art`.
 */
export const DROP_CARDS: DropCard[] = [
  {
    id: 'tortilla-base',
    name: 'Plain Tortilla',
    blurb: 'The shell that started it.',
    rarity: 'common',
    art: '/menu/tortilla.jpg',
    weight: 10,
  },
  {
    id: 'lettuce-scrap',
    name: 'Lettuce Scrap',
    blurb: 'Crisp. Forgettable. Common.',
    rarity: 'common',
    art: '/menu/salat.jpg',
    weight: 10,
  },
  {
    id: 'corn-kernel',
    name: 'Lone Kernel',
    blurb: 'One yellow soldier.',
    rarity: 'common',
    art: '/menu/mais.jpg',
    weight: 8,
  },
  {
    id: 'cream-smear',
    name: 'Cream Smear',
    blurb: 'Frischkäse fingerprint.',
    rarity: 'uncommon',
    art: '/menu/frischkaese.jpg',
    weight: 8,
  },
  {
    id: 'tomato-slice',
    name: 'Tomato Slice',
    blurb: 'Red ring of fate.',
    rarity: 'uncommon',
    art: '/menu/tomate.jpg',
    weight: 7,
  },
  {
    id: 'onion-ring',
    name: 'Onion Ring',
    blurb: 'Makes the kitchen cry.',
    rarity: 'uncommon',
    art: '/menu/zwiebel.jpg',
    weight: 7,
  },
  {
    id: 'avocado-cut',
    name: 'Avocado Cut',
    blurb: 'Green gold.',
    rarity: 'rare',
    art: '/menu/avocado.png',
    weight: 6,
  },
  {
    id: 'pepper-flare',
    name: 'Pepper Flare',
    blurb: 'Crunch with attitude.',
    rarity: 'rare',
    art: '/menu/paprika.jpg',
    weight: 6,
  },
  {
    id: 'turkey-strip',
    name: 'Pute Strip',
    blurb: 'Protein drop.',
    rarity: 'rare',
    art: '/menu/pute.jpg',
    weight: 5,
  },
  {
    id: 'sambal-storm',
    name: 'Sambal Storm',
    blurb: 'Heat aura unlocked.',
    rarity: 'epic',
    art: '/menu/sambal.jpg',
    weight: 4,
    kind: 'ingredient',
  },
  {
    id: 'heat-wave',
    name: 'Heat Wave Aura',
    blurb: 'The wrap that burns the line.',
    rarity: 'epic',
    art: '/menu/heatwave.jpg',
    weight: 4,
    kind: 'wrap',
  },
  {
    id: 'garden-glow',
    name: 'Garden Glow',
    blurb: 'Soft green myth.',
    rarity: 'legendary',
    art: '/menu/garden.jpg',
    weight: 3,
    kind: 'wrap',
  },
  {
    id: 'noir-roll',
    name: 'Noir Roll',
    blurb: 'Black shell. Quiet power.',
    rarity: 'legendary',
    art: '/menu/noir.jpg',
    weight: 3,
    kind: 'wrap',
  },
  {
    id: 'classic-myth',
    name: 'Classic Myth',
    blurb: 'The original WRAAAP omen.',
    rarity: 'mythic',
    art: '/menu/classic.jpg',
    weight: 2,
    kind: 'wrap',
  },
  {
    id: 'sunset-omen',
    name: 'Sunset Omen',
    blurb: 'Sol-tier wrap aura.',
    rarity: 'mythic',
    art: '/menu/sunset.jpg',
    weight: 1,
    kind: 'wrap',
  },
  {
    id: 'rosa-soft',
    name: 'Rosa Soft',
    blurb: 'Blush wrap aura.',
    rarity: 'legendary',
    art: '/menu/rosa.jpg',
    weight: 3,
    kind: 'wrap',
  },
  {
    id: 'espresso-notice',
    name: 'Espresso Notice',
    blurb: 'AMV-tier blush. She looked. You clipped it. 1/2500.',
    rarity: 'divine',
    art: '/menu/rosa.jpg',
    weight: 1,
    kind: 'wrap',
  },
  {
    id: 'focus-water',
    name: 'Focus Water',
    blurb: 'Apple motion graphic · watermark hold · tuff bed.',
    rarity: 'epic',
    art: '/menu/classic.jpg',
    weight: 2,
    kind: 'wrap',
  },
]

export const INVENTORY_KEY = 'wraaap-card-inventory'
export const INVENTORY_EVENT = 'wraaap-cards-changed'

export type OwnedCard = {
  cardId: string
  gotAt: string
  from: string
}

function rng01() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] / 0xffffffff
  }
  return Math.random()
}

/** Sol's RNG style: one roll, rarest threshold first */
export function rollRarity(): CardRarity {
  const roll = rng01()
  if (roll < 1 / 2500) return 'divine'
  if (roll < 1 / 400) return 'mythic'
  if (roll < 1 / 120) return 'legendary'
  if (roll < 1 / 40) return 'epic'
  if (roll < 1 / 12) return 'rare'
  if (roll < 0.25) return 'uncommon'
  return 'common'
}

export function rollCard(): DropCard {
  const rarity = rollRarity()
  const pool = DROP_CARDS.filter((card) => card.rarity === rarity)
  const list = pool.length ? pool : DROP_CARDS.filter((c) => c.rarity === 'common')
  const total = list.reduce((sum, card) => sum + card.weight, 0)
  let tick = rng01() * total
  for (const card of list) {
    tick -= card.weight
    if (tick <= 0) return card
  }
  return list[list.length - 1]
}

/** Bandit only drops a card on strong hits */
export function shouldDropCard(kind: 'jackpot' | 'triple' | 'pair' | 'nudge' | 'bust') {
  if (kind === 'jackpot') return true
  if (kind === 'triple') return rng01() < 0.85
  if (kind === 'pair') return rng01() < 0.22
  if (kind === 'nudge') return rng01() < 0.08
  return false
}

export function loadInventory(): OwnedCard[] {
  try {
    const raw = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]') as OwnedCard[]
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export function saveInventory(items: OwnedCard[]) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items.slice(0, 120)))
  window.dispatchEvent(new Event(INVENTORY_EVENT))
}

export function addToInventory(cardId: string, from: string) {
  const next = [{ cardId, gotAt: new Date().toISOString(), from }, ...loadInventory()].slice(
    0,
    120,
  )
  saveInventory(next)
  return next
}

export function getCard(id: string) {
  return DROP_CARDS.find((card) => card.id === id)
}

export function inventoryCounts(owned: OwnedCard[]) {
  const map = new Map<string, number>()
  for (const row of owned) {
    map.set(row.cardId, (map.get(row.cardId) || 0) + 1)
  }
  return map
}

/** Bandit hit types — only these count as a real roll for edit replay. */
export const ROLL_SOURCES = new Set(['jackpot', 'triple', 'pair', 'nudge'])

export function hasRolledCard(owned: OwnedCard[], cardId: string) {
  return owned.some((row) => row.cardId === cardId && ROLL_SOURCES.has(row.from))
}

const REPLAY_RARITIES = new Set<CardRarity>(['legendary', 'mythic', 'divine', 'epic'])

export function canReplayEdit(owned: OwnedCard[], card: DropCard) {
  return REPLAY_RARITIES.has(card.rarity) && hasRolledCard(owned, card.id)
}

export function uniqueWrapCount(owned: OwnedCard[]) {
  const ids = new Set(
    owned
      .map((row) => getCard(row.cardId))
      .filter((card): card is DropCard => !!card && card.kind === 'wrap')
      .map((card) => card.id),
  )
  return ids.size
}

export const WRAP_CURSOR_NEED = 3

