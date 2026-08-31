/** Rendered AE / CapCut edits — drop files in public/edits/. */
export type EditVideoKey = 'mamacita' | 'headlock' | 'romance' | 'divine' | 'focuswater'

/** Prefer mp4 (browser), then mov (AE High Quality export). */
export const EDIT_VIDEO_CANDIDATES: Record<EditVideoKey, string[]> = {
  mamacita: ['edits/mamacita.mp4', 'edits/mamacita.mov', 'edits/mamacita-test.mov'],
  headlock: ['edits/headlock.mp4', 'edits/headlock.mov'],
  romance: ['edits/romance.mp4', 'edits/romance.mov'],
  divine: ['edits/divine.mp4', 'edits/divine.mov'],
  focuswater: ['edits/focuswater.mp4', 'edits/focuswater.mov'],
}

export function editVideoUrls(preset: string): string[] {
  if (!(preset in EDIT_VIDEO_CANDIDATES)) return []
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return EDIT_VIDEO_CANDIDATES[preset as EditVideoKey].map((file) => `${prefix}${file}`)
}

/** Files that actually ship in public/edits — skip HEAD (fails on iOS/Safari). */
const SHIPPED_EDIT_VIDEOS = new Set<EditVideoKey>(['mamacita', 'focuswater'])

export function hasShippedEditVideo(preset: string) {
  return SHIPPED_EDIT_VIDEOS.has(preset as EditVideoKey)
}

export function editVideoUrlDirect(preset: string): string | null {
  if (!hasShippedEditVideo(preset)) return null
  const urls = editVideoUrls(preset)
  return urls[0] ?? null
}
