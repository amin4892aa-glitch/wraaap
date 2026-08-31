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

/** Focuswater always ships with public/edits/focuswater.mp4 — skip flaky HEAD probes. */
export function editVideoUrlDirect(preset: string): string | null {
  const urls = editVideoUrls(preset)
  return urls[0] ?? null
}

/** HEAD request — first existing render in /public/edits. Cached per session. */
const probeCache = new Map<string, string | null>()

export async function probeEditVideo(preset: string): Promise<string | null> {
  if (probeCache.has(preset)) return probeCache.get(preset) ?? null

  for (const url of editVideoUrls(preset)) {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'force-cache' })
      if (res.ok) {
        probeCache.set(preset, url)
        return url
      }
    } catch {
      /* try next */
    }
  }
  probeCache.set(preset, null)
  return null
}
