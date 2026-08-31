/** Low, soft, satisfying casino SFX — cortisol-down, no shrill clicks. */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let warmth: BiquadFilterNode | null = null
let muted = false

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.88
    warmth = ctx.createBiquadFilter()
    warmth.type = 'lowpass'
    warmth.frequency.value = 5200
    warmth.Q.value = 0.35
    master.connect(warmth)
    warmth.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function bus(): GainNode | null {
  ac()
  return master
}

function noiseBuffer(seconds: number): AudioBuffer | null {
  const audio = ac()
  if (!audio) return null
  const len = Math.floor(audio.sampleRate * seconds)
  const buf = audio.createBuffer(1, len, audio.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  // brown-ish noise — softer, low-pitched grit
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.5
  }
  return buf
}

/** Soft sine / triangle pad with gentle attack + long tail. */
function soft(
  freq: number,
  start: number,
  dur: number,
  vol: number,
  type: OscillatorType = 'sine',
  slideTo?: number,
) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return

  const osc = audio.createOscillator()
  const g = audio.createGain()
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  // square needs higher cutoff or it loses the Roblox bite
  lp.frequency.value =
    type === 'square' ? Math.min(5200, freq * 8) : Math.min(1800, freq * 4)
  osc.type = type
  osc.frequency.setValueAtTime(Math.max(28, freq), start)
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(28, slideTo), start + dur * 0.85)
  }
  const attack = type === 'square' ? 0.008 : Math.min(0.04, dur * 0.2)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(vol, start + attack)
  g.gain.exponentialRampToValueAtTime(vol * (type === 'square' ? 0.35 : 0.55), start + dur * 0.4)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(lp)
  lp.connect(g)
  g.connect(out)
  osc.start(start)
  osc.stop(start + dur + 0.04)
}

/** Deep chest thud — main satisfying hit. */
function deepThud(start: number, vol = 0.4, pitch = 1) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return

  // sub
  soft(52 * pitch, start, 0.28, vol * 0.9, 'sine', 28 * pitch)
  // body
  soft(92 * pitch, start, 0.18, vol * 0.45, 'triangle', 48 * pitch)
  // soft membrane noise
  const buf = noiseBuffer(0.14)
  if (!buf) return
  const src = audio.createBufferSource()
  src.buffer = buf
  const ng = audio.createGain()
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 280
  ng.gain.setValueAtTime(vol * 0.28, start)
  ng.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)
  src.connect(lp)
  lp.connect(ng)
  ng.connect(out)
  src.start(start)
}

/** Muted wood / marble tick — low & soft, not clicky. */
function softTick(start: number, pitch = 1, vol = 0.12) {
  if (muted) return
  soft(180 * pitch, start, 0.055, vol, 'sine', 90 * pitch)
  soft(260 * pitch, start, 0.04, vol * 0.35, 'triangle', 120 * pitch)
}

/**
 * Classic casino slot-machine reel clack —
 * short metallic ratchet like rolling SFX libraries.
 */
function slotClack(start: number, speed = 1, vol = 0.14) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return

  const pitch = 0.85 + Math.random() * 0.3
  const rate = Math.max(0.35, Math.min(1.4, speed))

  // metallic transient (the "tick")
  const osc = audio.createOscillator()
  const og = audio.createGain()
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 780 + rate * 520 * pitch
  bp.Q.value = 4.5
  osc.type = 'square'
  osc.frequency.setValueAtTime(620 * pitch * rate, start)
  osc.frequency.exponentialRampToValueAtTime(280 * pitch, start + 0.028)
  og.gain.setValueAtTime(vol * 0.55, start)
  og.gain.exponentialRampToValueAtTime(0.0001, start + 0.032)
  osc.connect(bp)
  bp.connect(og)
  og.connect(out)
  osc.start(start)
  osc.stop(start + 0.04)

  // plastic/wood body
  soft(240 * pitch * rate, start, 0.028, vol * 0.35, 'triangle', 110 * pitch)

  // grit burst through bandpass — the rolling texture
  const buf = noiseBuffer(0.05)
  if (!buf) return
  const src = audio.createBufferSource()
  src.buffer = buf
  const ng = audio.createGain()
  const nf = audio.createBiquadFilter()
  nf.type = 'bandpass'
  nf.frequency.value = 900 + rate * 700
  nf.Q.value = 1.8
  ng.gain.setValueAtTime(vol * 0.55, start)
  ng.gain.exponentialRampToValueAtTime(0.0001, start + 0.038)
  src.connect(nf)
  nf.connect(ng)
  ng.connect(out)
  src.start(start)
}

/** Continuous reel whir under the clacks. */
let whirGain: GainNode | null = null
let whirHumGain: GainNode | null = null
let whirSrc: AudioBufferSourceNode | null = null
let whirOsc: OscillatorNode | null = null

function startReelWhir(vol = 0.1) {
  if (muted) return
  stopReelWhir(0.02)
  const audio = ac()
  const out = bus()
  if (!audio || !out) return

  const buf = noiseBuffer(1.2)
  if (!buf) return

  const src = audio.createBufferSource()
  src.buffer = buf
  src.loop = true

  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 620
  bp.Q.value = 0.9

  const g = audio.createGain()
  g.gain.setValueAtTime(0.0001, audio.currentTime)
  g.gain.exponentialRampToValueAtTime(vol, audio.currentTime + 0.08)

  // subtle motor hum
  const hum = audio.createOscillator()
  const hg = audio.createGain()
  hum.type = 'sawtooth'
  hum.frequency.value = 48
  hg.gain.setValueAtTime(0.0001, audio.currentTime)
  hg.gain.exponentialRampToValueAtTime(vol * 0.22, audio.currentTime + 0.08)
  const hlp = audio.createBiquadFilter()
  hlp.type = 'lowpass'
  hlp.frequency.value = 180

  src.connect(bp)
  bp.connect(g)
  g.connect(out)
  hum.connect(hlp)
  hlp.connect(hg)
  hg.connect(out)

  src.start()
  hum.start()
  whirSrc = src
  whirOsc = hum
  whirGain = g
  whirHumGain = hg
}

function setReelWhirLevel(level: number) {
  if (!whirGain) return
  const audio = ac()
  if (!audio) return
  const v = Math.max(0.0001, level)
  whirGain.gain.cancelScheduledValues(audio.currentTime)
  whirGain.gain.exponentialRampToValueAtTime(v, audio.currentTime + 0.08)
  if (whirHumGain) {
    whirHumGain.gain.cancelScheduledValues(audio.currentTime)
    whirHumGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, v * 0.22), audio.currentTime + 0.08)
  }
}

function stopReelWhir(fade = 0.12) {
  const audio = ac()
  const g = whirGain
  const hg = whirHumGain
  const src = whirSrc
  const hum = whirOsc
  whirGain = null
  whirHumGain = null
  whirSrc = null
  whirOsc = null

  const kill = () => {
    try {
      src?.stop()
    } catch {
      /* already stopped */
    }
    try {
      hum?.stop()
    } catch {
      /* already stopped */
    }
  }

  if (!audio || (!g && !hg)) {
    kill()
    return
  }

  const t = audio.currentTime
  if (g) {
    g.gain.cancelScheduledValues(t)
    g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + fade)
  }
  if (hg) {
    hg.gain.cancelScheduledValues(t)
    hg.gain.setValueAtTime(Math.max(0.0001, hg.gain.value), t)
    hg.gain.exponentialRampToValueAtTime(0.0001, t + fade)
  }
  window.setTimeout(kill, fade * 1000 + 30)
}

/**
 * Custom WRAAAP win sting (public/sfx/wraap-win.mp3).
 * Slot wins (pair+) and aura cutscene reveals.
 * Skip the intro; play through to the natural end.
 */
const WIN_SFX_URL = `${import.meta.env.BASE_URL}sfx/wraap-win.mp3`
/** Trim short lead-in; keep most of the sting. */
const AURA_WIN_SKIP_SEC = 0.85
/** Order-ready: start a bit earlier in the clip and let more of it play. */
const READY_WIN_SKIP_SEC = 0.35
const READY_WIN_TAIL_RESERVE_SEC = 1.8
let winEl: HTMLAudioElement | null = null
let winBuffer: AudioBuffer | null = null
let winLoad: Promise<AudioBuffer | null> | null = null
let winSrc: AudioBufferSourceNode | null = null

function getWinEl(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!winEl) {
    winEl = new Audio(WIN_SFX_URL)
    winEl.preload = 'auto'
    winEl.setAttribute('playsinline', 'true')
  }
  return winEl
}

function loadWinBuffer(): Promise<AudioBuffer | null> {
  if (winBuffer) return Promise.resolve(winBuffer)
  if (winLoad) return winLoad
  winLoad = (async () => {
    try {
      const audio = ac()
      if (!audio) return null
      const res = await fetch(WIN_SFX_URL)
      if (!res.ok) return null
      const raw = await res.arrayBuffer()
      winBuffer = await audio.decodeAudioData(raw.slice(0))
      return winBuffer
    } catch {
      winLoad = null
      return null
    }
  })()
  return winLoad
}

function stopWinSample() {
  if (winEl) {
    try {
      winEl.pause()
      winEl.currentTime = 0
    } catch {
      /* ignore */
    }
  }
  const audio = ac()
  if (winSrc && audio) {
    try {
      winSrc.stop(audio.currentTime)
    } catch {
      /* already stopped */
    }
  }
  winSrc = null
}

/** Soft synth jingle for normal slot wins (no MP3). */
function winningSoundSynth(start: number, level = 3) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return

  const n = Math.max(1, Math.min(5, level))
  const base = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568]
  const notes = base.slice(0, 3 + Math.min(3, n))

  notes.forEach((f, i) => {
    const when = start + i * 0.09
    soft(f, when, 0.22, 0.28, 'square')
    soft(f * 2, when, 0.12, 0.1, 'square')
    soft(f, when, 0.28, 0.12, 'triangle')
  })

  const top = notes[notes.length - 1]
  soft(top, start + notes.length * 0.09, 0.4, 0.24, 'square')
  soft(top * 1.5, start + notes.length * 0.09 + 0.02, 0.3, 0.1, 'triangle')
}

function skipStartOffset(duration: number, skipSec = AURA_WIN_SKIP_SEC, tailReserveSec = 2.5) {
  if (!Number.isFinite(duration) || duration <= 0.5) return 0
  const maxSkip = Math.max(0, duration - tailReserveSec)
  return Math.min(skipSec, maxSkip)
}

type WinSfxOpts = {
  skipSec?: number
  tailReserveSec?: number
}

/** WRAAAP win MP3 — WebAudio first (survives edit cutscenes better). */
function playAuraWinSfx(opts: WinSfxOpts = {}) {
  if (muted) return
  const skipSec = opts.skipSec ?? AURA_WIN_SKIP_SEC
  const tailReserveSec = opts.tailReserveSec ?? 2.5
  const audioCtx = ac()
  if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume()

  void loadWinBuffer().then((buf) => {
    if (!buf || muted) {
      // HTMLAudio fallback
      const el = getWinEl()
      if (!el) return
      stopWinSample()
      const startAt = () => {
        const dur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 7.2
        el.currentTime = skipStartOffset(dur, skipSec, tailReserveSec)
        el.volume = 1
      }
      if (el.readyState >= 1) startAt()
      else el.addEventListener('loadedmetadata', startAt, { once: true })
      void el.play().catch(() => {
        /* ignore */
      })
      return
    }
    playAuraWinBuffer(buf, skipSec, tailReserveSec)
  })
}

function playAuraWinBuffer(buf: AudioBuffer, skipSec = AURA_WIN_SKIP_SEC, tailReserveSec = 2.5) {
  if (muted) return
  const audio = ac()
  if (!audio || !master) return
  stopWinSample()
  const offset = skipStartOffset(buf.duration, skipSec, tailReserveSec)
  const src = audio.createBufferSource()
  src.buffer = buf
  const g = audio.createGain()
  const when = audio.currentTime
  g.gain.setValueAtTime(0.95, when)
  src.connect(g)
  g.connect(master)
  src.start(when, offset)
  winSrc = src
  src.onended = () => {
    if (winSrc === src) winSrc = null
  }
}

/** Wrap-ready sting — earlier entry, longer tail. */
export function playReadyWin() {
  playAuraWinSfx({ skipSec: READY_WIN_SKIP_SEC, tailReserveSec: READY_WIN_TAIL_RESERVE_SEC })
}

export function unlockGambleAudio() {
  const audio = ac()
  if (audio && audio.state === 'suspended') void audio.resume()
  // Preload once — never el.load() here (that aborts an in-flight win sting).
  const el = getWinEl()
  if (el && el.readyState < 1) {
    try {
      el.preload = 'auto'
      el.load()
    } catch {
      /* ignore */
    }
  }
  void loadWinBuffer()
}

/** Hard-kill any stuck loops (reel whir / hum / edit bed / win sting). */
export function silenceGambleAudio() {
  stopReelWhir(0.05)
  stopEditBed(0.08)
  stopWinSample()
}

/**
 * Real edit soundtrack under god cutscenes.
 * Play MUST stay sync with a user gesture — no await/HEAD before play().
 */
let editTrackEl: HTMLAudioElement | null = null
let editTrackActive = false
let editTrackSrc: AudioBufferSourceNode | null = null
let editTrackGain: GainNode | null = null

const EDIT_TRACK_CANDIDATES: Record<string, string[]> = {
  mamacita: ['edit-mamacita.mp3', 'edit-mamacita.mp4'],
  headlock: ['edit-headlock.mp3', 'edit-headlock.mp4'],
  romance: ['edit-romance.mp3', 'edit-romance.mp4'],
  divine: ['edit-divine.mp3', 'edit-divine.mp4'],
  focuswater: ['edit-focuswater.mp3', 'edit-focuswater.mp4'],
}

export function isEditTrackPlaying() {
  if (editTrackActive && editTrackSrc) return true
  return editTrackActive && !!editTrackEl && !editTrackEl.paused
}

export function stopEditBed(fade = 0.08) {
  editTrackActive = false
  const el = editTrackEl
  editTrackEl = null
  const src = editTrackSrc
  const eg = editTrackGain
  editTrackSrc = null
  editTrackGain = null

  if (src) {
    try {
      const audio = ac()
      if (eg && audio && fade > 0) {
        eg.gain.cancelScheduledValues(audio.currentTime)
        eg.gain.setValueAtTime(Math.max(0.0001, eg.gain.value), audio.currentTime)
        eg.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + fade)
        src.stop(audio.currentTime + fade + 0.02)
      } else {
        src.stop()
      }
    } catch {
      /* ignore */
    }
  }

  if (!el) return
  try {
    if (fade <= 0) {
      el.pause()
      el.removeAttribute('src')
      el.load()
      return
    }
    const step = () => {
      if (el.volume > 0.05) {
        el.volume = Math.max(0, el.volume - 0.14)
        window.setTimeout(step, Math.max(16, fade * 160))
      } else {
        el.pause()
        el.removeAttribute('src')
        el.load()
      }
    }
    step()
  } catch {
    try {
      el.pause()
    } catch {
      /* ignore */
    }
  }
}

function tryPlayEditUrl(url: string): HTMLAudioElement {
  const el = new Audio(url)
  el.preload = 'auto'
  el.loop = false
  el.volume = 1
  el.setAttribute('playsinline', 'true')
  return el
}

async function playEditViaWebAudio(url: string) {
  const audio = ac()
  if (!audio || !master) return false
  try {
    if (audio.state === 'suspended') await audio.resume()
    const res = await fetch(url)
    if (!res.ok) return false
    const raw = await res.arrayBuffer()
    const buf = await audio.decodeAudioData(raw.slice(0))
    const src = audio.createBufferSource()
    const g = audio.createGain()
    g.gain.value = 1
    src.buffer = buf
    src.connect(g)
    g.connect(master)
    src.start()
    editTrackSrc = src
    editTrackGain = g
    editTrackActive = true
    src.onended = () => {
      if (editTrackSrc === src) {
        editTrackSrc = null
        editTrackGain = null
        editTrackActive = false
      }
    }
    return true
  } catch {
    return false
  }
}

export function startEditBed(
  style: 'headlock' | 'romance' | 'divine' | 'mamacita' | 'focuswater' | 'auto' = 'mamacita',
) {
  if (muted) return
  if (isEditTrackPlaying()) return

  stopEditBed(0)
  unlockGambleAudio()

  const key = style === 'auto' ? 'headlock' : style
  const files = EDIT_TRACK_CANDIDATES[key]
  if (!files?.length) return

  const base = import.meta.env.BASE_URL || './'
  const urls = files.map((file) => `${base}sfx/${file}`)

  const el = tryPlayEditUrl(urls[0])
  editTrackEl = el
  editTrackActive = true

  const failOver = async (index: number) => {
    if (editTrackEl !== el && !editTrackSrc) return
    // Prefer WebAudio (works after AudioContext unlock even without fresh gesture)
    const ok = await playEditViaWebAudio(urls[index] || urls[0])
    if (ok) {
      try {
        el.pause()
      } catch {
        /* ignore */
      }
      if (editTrackEl === el) editTrackEl = null
      return
    }
    const next = urls[index + 1]
    if (!next) {
      editTrackActive = false
      if (editTrackEl === el) editTrackEl = null
      return
    }
    el.src = next
    void el
      .play()
      .then(() => {
        editTrackActive = true
      })
      .catch(() => {
        void failOver(index + 1)
      })
  }

  void el
    .play()
    .then(() => {
      editTrackActive = true
    })
    .catch(() => {
      void failOver(0)
    })
}

/** Map card → edit track; call from click handlers so autoplay is allowed. */
export function startEditForCard(cardId: string, rarity?: string) {
  if (cardId === 'focus-water') {
    startEditBed('focuswater')
    return
  }
  if (cardId === 'sunset-omen' || cardId === 'heat-wave' || rarity === 'epic') {
    startEditBed('mamacita')
    return
  }
  if (cardId === 'espresso-notice' || rarity === 'divine') {
    startEditBed('divine')
    return
  }
  if (cardId === 'garden-glow' || cardId === 'noir-roll' || rarity === 'legendary') {
    startEditBed('headlock')
    return
  }
  if (cardId === 'classic-myth' || cardId === 'rosa-soft' || rarity === 'mythic') {
    startEditBed('romance')
  }
}

function editTrackPlaying() {
  return isEditTrackPlaying()
}

function whoosh(start: number, vol = 0.35) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return
  const buf = noiseBuffer(0.35)
  if (!buf) return
  const src = audio.createBufferSource()
  src.buffer = buf
  const bp = audio.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.7
  bp.frequency.setValueAtTime(400, start)
  bp.frequency.exponentialRampToValueAtTime(3200, start + 0.18)
  bp.frequency.exponentialRampToValueAtTime(600, start + 0.32)
  const g = audio.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(vol, start + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, start + 0.32)
  src.connect(bp)
  bp.connect(g)
  g.connect(out)
  src.start(start)
  soft(90, start, 0.2, vol * 0.35, 'sine', 40)
}

function collapseRumble(start: number, vol = 0.4) {
  if (muted) return
  const audio = ac()
  const out = bus()
  if (!audio || !out) return
  soft(38, start, 0.95, vol * 0.7, 'sine', 22)
  soft(55, start + 0.15, 0.8, vol * 0.45, 'triangle', 30)
  const buf = noiseBuffer(1)
  if (!buf) return
  const src = audio.createBufferSource()
  src.buffer = buf
  const lp = audio.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(180, start)
  lp.frequency.exponentialRampToValueAtTime(900, start + 0.9)
  const g = audio.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(vol * 0.55, start + 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, start + 1.05)
  src.connect(lp)
  lp.connect(g)
  g.connect(out)
  src.start(start)
}

function dropHit(start: number, vol = 0.55) {
  if (muted) return
  deepThud(start, vol, 0.85)
  deepThud(start + 0.04, vol * 0.7, 1.15)
  whoosh(start, vol * 0.7)
  soft(40, start, 0.4, vol * 0.6, 'sine', 22)
  soft(220, start + 0.02, 0.12, vol * 0.35, 'square', 80)
  soft(1200, start, 0.05, vol * 0.2, 'square', 400)
}

export function setGambleMuted(next: boolean) {
  muted = next
  if (next) silenceGambleAudio()
}

export function playLeverPull() {
  if (muted) return
  const audio = ac()
  if (!audio) return
  const t = audio.currentTime
  // mechanical arm: clunk + spring
  deepThud(t, 0.5, 0.88)
  soft(70, t + 0.02, 0.28, 0.2, 'triangle', 36)
  slotClack(t + 0.08, 0.7, 0.12)
  slotClack(t + 0.14, 0.55, 0.08)
  startReelWhir(0.11)
}

/** Fast rolling clack while reels spin (call ~every 30–50ms). speed 1=fast → 0=stop. */
export function playReelTick(phase = 0) {
  if (muted) return
  const audio = ac()
  if (!audio) return
  const speed = 1.05 - phase * 0.15
  slotClack(audio.currentTime, speed, 0.11)
  // double-clack densifies the classic rolling texture
  if (Math.random() > 0.35) {
    slotClack(audio.currentTime + 0.012, speed * 0.92, 0.06)
  }
}

export function playReelLock(index: number) {
  if (muted) return
  const audio = ac()
  if (!audio) return
  const t = audio.currentTime
  const pitch = 0.9 + index * 0.1
  // hard stop ka-CHUNK
  deepThud(t, 0.38 + index * 0.05, pitch)
  slotClack(t, 0.55, 0.16)
  soft(130 + index * 30, t, 0.16, 0.14, 'triangle', 70)
  soft(55, t + 0.1, 0.22, 0.12, 'sine', 34)
  // whir drops as reels lock
  setReelWhirLevel(0.09 - index * 0.028)
  if (index === 2) {
    stopReelWhir(0.22)
    soft(90, t + 0.08, 0.12, 0.1, 'sine', 150)
  }
}

export function stopSlotRoll() {
  stopReelWhir(0.15)
}

export function playWin(kind: 'nudge' | 'pair' | 'triple' | 'jackpot') {
  if (muted) return
  unlockGambleAudio()
  stopReelWhir(0.08)

  // Full MP3 on real hits; nudge stays short so it doesn't stack weird
  if (kind === 'nudge') {
    const audio = ac()
    if (audio) winningSoundSynth(audio.currentTime, 2)
    return
  }
  playAuraWinSfx()
}

export function playBust() {
  if (muted) return
  const audio = ac()
  if (!audio) return
  const t = audio.currentTime
  soft(90, t, 0.35, 0.14, 'triangle', 42)
  deepThud(t + 0.05, 0.28, 0.75)
  soft(48, t + 0.12, 0.4, 0.16, 'sine', 30)
}

export function playCutBeat(
  cut: string,
  intensity: 'normal' | 'legendary' | 'mythic' | 'divine' | 'mamacita' = 'normal',
) {
  if (muted) return
  // When the real edit track is playing, don't layer fake synth on top —
  // keep the edit sounding like the original audio.
  if (editTrackPlaying()) return
  const audio = ac()
  if (!audio) return
  const t = audio.currentTime
  const boost =
    intensity === 'mamacita'
      ? 1.45
      : intensity === 'divine'
        ? 1.2
        : intensity === 'mythic'
          ? 1.3
          : intensity === 'legendary'
            ? 1.25
            : 1

  if (cut === 'collapse') {
    collapseRumble(t, 0.5 * boost)
    return
  }
  if (cut === 'drop') {
    dropHit(t, 0.62 * boost)
    return
  }
  if (cut === 'whoosh') {
    whoosh(t, 0.4 * boost)
    return
  }
  if (cut === 'stutter') {
    softTick(t, 1.4, 0.1 * boost)
    soft(240, t, 0.05, 0.12 * boost, 'square', 120)
    return
  }
  if (cut === 'cliphold' || cut === 'slamzoom') {
    soft(48, t, 0.35, 0.18 * boost, 'sine', 32)
    soft(110, t + 0.05, 0.4, 0.1 * boost, 'triangle', 60)
    if (cut === 'slamzoom') deepThud(t + 0.08, 0.35 * boost, 0.95)
    return
  }

  // Headlock AE — hard bass + lyric ticks
  if (intensity === 'legendary' || intensity === 'mamacita') {
    if (cut === 'lyric' || cut === 'align') {
      soft(55, t, 0.08, 0.2 * boost, 'sine', 40)
      soft(320, t, 0.12, 0.14 * boost, 'triangle')
      soft(640, t + 0.03, 0.08, 0.08, 'square')
      return
    }
    if (cut === 'headlock' || cut === 'perspective' || cut === 'velocity') {
      deepThud(t, 0.55 * boost, 0.85)
      soft(70, t, 0.35, 0.28 * boost, 'sine', 35)
      soft(180, t + 0.06, 0.2, 0.16 * boost, 'triangle', 90)
      soft(900, t + 0.1, 0.12, 0.1, 'square', 400)
      if (intensity === 'mamacita') whoosh(t, 0.25 * boost)
      return
    }
    if (cut === 'snap' || cut === 'stomp' || cut === 'slam' || cut === 'crash') {
      deepThud(t, 0.6 * boost, 1)
      soft(45, t, 0.25, 0.3 * boost, 'sine', 28)
      soft(200, t + 0.02, 0.1, 0.15, 'square', 80)
      return
    }
  }

  // Romance AMV — warm bells + heart
  if (intensity === 'mythic') {
    if (cut === 'bubble') {
      soft(392, t, 0.22, 0.18 * boost, 'square')
      soft(523, t + 0.05, 0.28, 0.14 * boost, 'triangle')
      soft(784, t + 0.1, 0.3, 0.1 * boost, 'sine')
      return
    }
    if (cut === 'heart' || cut === 'blush' || cut === 'bloom') {
      soft(72, t, 0.12, 0.18 * boost, 'sine', 55)
      soft(72, t + 0.12, 0.14, 0.2 * boost, 'sine', 50)
      soft(294, t + 0.04, 0.4, 0.12 * boost, 'triangle')
      soft(440, t + 0.1, 0.45, 0.1 * boost, 'sine')
      return
    }
  }

  // soft AMV cuts — heart double-thump + blush pad
  if (cut === 'heart' || cut === 'bloom' || cut === 'blush') {
    soft(70, t, 0.12, 0.14 * boost, 'sine', 55)
    soft(70, t + 0.11, 0.14, 0.16 * boost, 'sine', 50)
    soft(220, t + 0.04, 0.35, 0.1 * boost, 'triangle')
    soft(330, t + 0.1, 0.4, 0.08 * boost, 'sine')
    return
  }
  if (cut === 'softflash' || cut === 'softzoom' || cut === 'sparkle') {
    soft(160, t, 0.16, 0.12 * boost, 'sine', 240)
    softTick(t, 1.05, 0.06)
    soft(98, t + 0.05, 0.28, 0.08, 'triangle')
    return
  }
  if (cut === 'punch' || cut === 'snap') {
    deepThud(t, 0.36 * boost, 1.05)
    soft(185, t, 0.18, 0.14 * boost, 'sine', 120)
    return
  }
  if (cut === 'lyric' || cut === 'headlock' || cut === 'align') {
    soft(90, t, 0.1, 0.12 * boost, 'sine', 70)
    soft(220, t + 0.03, 0.2, 0.1 * boost, 'triangle')
    softTick(t + 0.02, 1.1, 0.07)
    return
  }
  if (cut === 'velocity' || cut === 'perspective') {
    soft(60, t, 0.22, 0.18 * boost, 'sine', 40)
    soft(180, t + 0.08, 0.28, 0.14 * boost, 'triangle', 320)
    deepThud(t + 0.12, 0.32 * boost, 1)
    return
  }
  if (cut === 'bubble') {
    soft(330, t, 0.18, 0.14 * boost, 'square')
    soft(440, t + 0.05, 0.2, 0.1 * boost, 'triangle')
    softTick(t, 1.2, 0.06)
    return
  }

  if (cut === 'whip' || cut === 'punchzoom') {
    deepThud(t, 0.5 * boost, 1.05)
    whoosh(t, 0.4 * boost)
    soft(55, t, 0.18, 0.22 * boost, 'sine', 32)
    soft(240, t + 0.03, 0.12, 0.12 * boost, 'square', 90)
    soft(700, t + 0.06, 0.1, 0.08, 'triangle', 300)
    return
  }
  if (cut === 'ae-shake' || cut === 'shake-hard' || cut === 'shake') {
    deepThud(t, 0.42 * boost, 0.95)
    soft(90, t, 0.08, 0.14 * boost, 'sawtooth', 50)
    softTick(t + 0.02, 1.3, 0.1)
    softTick(t + 0.05, 0.9, 0.08)
    if (intensity === 'mamacita') {
      soft(40, t, 0.25, 0.28 * boost, 'sine', 24)
      whoosh(t + 0.02, 0.22 * boost)
    }
    return
  }
  if (cut === 'flashframe') {
    soft(1400, t, 0.06, 0.14 * boost, 'square', 600)
    soft(80, t, 0.1, 0.12, 'sine', 40)
    return
  }

  if (cut === 'stomp' || cut === 'crash') {
    deepThud(t, 0.5 * boost, 0.9)
    soft(60, t, 0.28, 0.22 * boost, 'sine', 32)
    return
  }
  if (cut === 'flash' || cut === 'whiteout') {
    soft(160, t, 0.12, 0.14 * boost, 'sine', 90)
    softTick(t, 1.1, 0.08)
    return
  }
  if (cut === 'glitch' || cut === 'rgb' || cut === 'chromo' || cut === 'vhs') {
    softTick(t, 0.9, 0.08)
    soft(100, t, 0.08, 0.08 * boost, 'triangle', 55)
    softTick(t + 0.04, 0.7, 0.06)
    return
  }
  if (cut === 'lightleak' || cut === 'glow' || cut === 'deepglow') {
    soft(220, t, 0.22, 0.12 * boost, 'sine', 140)
    soft(440, t + 0.04, 0.28, 0.08 * boost, 'triangle', 220)
    softTick(t, 1.05, 0.05)
    return
  }
  if (cut === 'zoom-snap') {
    deepThud(t, 0.42 * boost, 1)
    whoosh(t, 0.28 * boost)
    soft(70, t, 0.16, 0.18 * boost, 'sine', 36)
    return
  }
  if (cut === 'risu-shake') {
    deepThud(t, 0.48 * boost, 1)
    soft(90, t, 0.08, 0.16 * boost, 'sawtooth', 48)
    softTick(t + 0.02, 1.4, 0.1)
    softTick(t + 0.05, 0.85, 0.08)
    whoosh(t, 0.2 * boost)
    return
  }
  if (cut === 'flicker' || cut === 'rgb-split' || cut === 'warp') {
    softTick(t, 1.1, 0.09)
    soft(140, t, 0.07, 0.1 * boost, 'square', 70)
    softTick(t + 0.04, 0.75, 0.06)
    return
  }
  if (cut === 'hold' || cut === 'slowmo') {
    soft(70, t, 0.5, 0.14 * boost, 'sine', 48)
    soft(105, t + 0.08, 0.55, 0.1 * boost, 'triangle', 70)
    return
  }
  if (cut === 'slam' || cut === 'spin') {
    deepThud(t, 0.4 * boost, 1)
    soft(130, t, 0.22, 0.16 * boost, 'sine', 80)
    soft(160, t + 0.05, 0.18, 0.1 * boost, 'sine', 220)
    return
  }
  softTick(t, 0.7 + Math.random() * 0.25, 0.06 * boost)
  soft(90, t, 0.08, 0.05, 'sine', 50)
}

export function playLegendaryReveal(mythic = false) {
  if (muted) return
  unlockGambleAudio()
  const audio = ac()
  if (audio) {
    const t = audio.currentTime
    if (mythic) {
      soft(65, t, 0.14, 0.2, 'sine', 48)
      soft(65, t + 0.13, 0.16, 0.24, 'sine', 45)
      soft(392, t + 0.1, 0.4, 0.14, 'triangle')
    } else {
      deepThud(t, 0.55, 0.9)
      soft(50, t, 0.35, 0.28, 'sine', 30)
    }
  }
  playAuraWinSfx()
}

/** Soft romantic AMV dopamine — then WRAAAP aura sting. */
export function playDivineReveal() {
  if (muted) return
  unlockGambleAudio()
  const audio = ac()
  if (audio) {
    const t = audio.currentTime
    soft(65, t, 0.14, 0.22, 'sine', 48)
    soft(65, t + 0.14, 0.16, 0.26, 'sine', 45)
  }
  playAuraWinSfx()
}
