/**
 * Clip reels for god edits — WRAAAP photos only (no ripped YT footage).
 * Different frames + crops = AMV “clip” language with our own art.
 */

export type Shot =
  | 'center'
  | 'close'
  | 'wide'
  | 'left'
  | 'right'
  | 'low'
  | 'high'
  | 'tilt'

export const MAMACITA_REEL = [
  '/menu/sunset.jpg',
  '/menu/heatwave.jpg',
  '/menu/sambal.jpg',
  '/menu/classic.jpg',
  '/menu/noir.jpg',
  '/menu/pute.jpg',
  '/menu/paprika.jpg',
  '/menu/tomate.jpg',
  '/menu/avocado.png',
  '/menu/garden.jpg',
] as const

export const HEADLOCK_REEL = [
  '/menu/garden.jpg',
  '/menu/noir.jpg',
  '/menu/classic.jpg',
  '/menu/rosa.jpg',
  '/menu/sunset.jpg',
  '/menu/pute.jpg',
] as const

export const ROMANCE_REEL = [
  '/menu/rosa.jpg',
  '/menu/classic.jpg',
  '/menu/garden.jpg',
  '/menu/sunset.jpg',
  '/menu/avocado.png',
  '/menu/frischkaese.jpg',
] as const

export const DIVINE_REEL = [
  '/menu/rosa.jpg',
  '/menu/classic.jpg',
  '/menu/garden.jpg',
  '/menu/sunset.jpg',
  '/menu/note.jpg',
] as const

export function reelArt(
  reel: readonly string[],
  index: number,
  fallback: string,
): string {
  if (!reel.length) return fallback
  return reel[((index % reel.length) + reel.length) % reel.length] || fallback
}
