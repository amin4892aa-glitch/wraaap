import { useEffect, useMemo, useRef, useState } from 'react'
import type { DropCard } from '../data/dropCards'
import { RARITY_META } from '../data/dropCards'
import {
  DIVINE_REEL,
  HEADLOCK_REEL,
  MAMACITA_REEL,
  ROMANCE_REEL,
  reelArt,
  type Shot,
} from '../data/editReels'
import { editVideoUrlDirect, probeEditVideo } from '../data/editVideos'
import {
  playCutBeat,
  playDivineReveal,
  playLegendaryReveal,
  startEditBed,
  stopEditBed,
  unlockGambleAudio,
  isEditTrackPlaying,
} from '../lib/gambleAudio'
import { WrapPokeCard } from './WrapPokeCard'
import './DropCutscene.css'
import './DropCutscene.faisal.css'

export type EditPreset = 'headlock' | 'romance' | 'divine' | 'mamacita' | 'focuswater' | 'auto'

/** Bumps on each cutscene audio effect mount — avoids StrictMode killing the track. */
let editMountSession = 0

const SLAMS = [
  'NO WAY',
  'COOKED',
  'AURA??',
  'WRAAAP',
  'SHEEEESH',
  'CLIP THAT',
  'HEAT',
  'DEADASS',
]

const BASE_CUTS = [
  'zoom-in',
  'zoom-out',
  'shake',
  'flash',
  'glitch',
  'spin',
  'bars',
  'invert',
] as const

const AE_CUTS = [
  ...BASE_CUTS,
  'stomp',
  'rgb',
  'slam',
  'pulse',
  'crash',
  'whiteout',
  'slowmo',
  'chromo',
  'hold',
  'lyric',
  'velocity',
  'snap',
  'perspective',
  'align',
  'headlock',
  'bubble',
  'bloom',
  'heart',
  'blush',
  'softflash',
  'softzoom',
  'sparkle',
  'punch',
  'whip',
  'shake-hard',
  'punchzoom',
  'flashframe',
  'ae-shake',
  'collapse',
  'drop',
  'whoosh',
  'stutter',
  'cliphold',
  'slamzoom',
  'lightleak',
  'vhs',
  'glow',
  'zoom-snap',
  'risu-shake',
  'flicker',
  'rgb-split',
  'deepglow',
  'warp',
] as const

type Cut = (typeof AE_CUTS)[number]

type Beat = {
  cut: Cut
  text: string
  ms: number
  size?: 'sm' | 'md' | 'xl' | 'god'
  lyric?: string
  /** Keep same art mount across beats (= one continuous clip) */
  clip?: string
  /** Override frame — reel photo path */
  art?: string
  /** B-roll underlay for dual-layer cuts */
  artB?: string
  shot?: Shot
  shotB?: Shot
}

type Props = {
  card: DropCard
  onDone: () => void
  /** Force a specific edit style (lounge replays) */
  forceEdit?: EditPreset
}

function rng(max: number) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % max
  }
  return Math.floor(Math.random() * max)
}

function pick<T>(list: readonly T[]): T {
  return list[rng(list.length)]
}

function resolvePreset(card: DropCard, force?: EditPreset): EditPreset {
  if (force && force !== 'auto') return force
  if (card.id === 'focus-water') return 'focuswater'
  if (card.id === 'espresso-notice') return 'divine'
  if (card.id === 'garden-glow' || card.id === 'noir-roll') return 'headlock'
  if (card.id === 'classic-myth' || card.id === 'rosa-soft') return 'romance'
  if (card.id === 'sunset-omen' || card.id === 'heat-wave') return 'mamacita'
  if (card.rarity === 'divine') return 'divine'
  if (card.rarity === 'mythic') return 'romance'
  if (card.rarity === 'legendary') return 'headlock'
  if (card.rarity === 'epic') return 'mamacita'
  return 'auto'
}

function buildEdit(preset: EditPreset, rarity: DropCard['rarity'], hero: string): Beat[] {
  if (preset === 'divine') return buildDivineEdit(hero)
  if (preset === 'romance') return buildRomanceAmvEdit(hero)
  if (preset === 'headlock') return buildHeadlockEdit(hero)
  if (preset === 'mamacita') return buildMamacitaEdit(hero)
  if (preset === 'focuswater') return buildFocuswaterEdit(hero)

  const intensity = rarity === 'epic' ? 8 : rarity === 'rare' ? 7 : 5
  const beats: Beat[] = []
  for (let i = 0; i < intensity; i++) {
    beats.push({
      cut: pick(BASE_CUTS),
      text: pick(SLAMS),
      ms: 85 + rng(100),
      size: 'md',
      art: hero,
    })
  }
  beats.push({
    cut: 'flash',
    text: RARITY_META[rarity].label,
    ms: 300,
    size: 'xl',
    art: hero,
  })
  return beats
}

/** HEADLOCK — multi-clip lyric AE */
function buildHeadlockEdit(hero: string): Beat[] {
  const r = HEADLOCK_REEL
  return [
    { cut: 'hold', text: '', ms: 700, size: 'sm', lyric: '…', clip: 'a', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'cliphold', text: '', ms: 750, size: 'sm', lyric: '…', clip: 'a', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'lyric', text: "i'm", ms: 380, size: 'md', lyric: "i'm", clip: 'a', art: reelArt(r, 1, hero), shot: 'left' },
    { cut: 'lyric', text: 'locked', ms: 420, size: 'xl', lyric: 'locked', art: reelArt(r, 2, hero), shot: 'right' },
    { cut: 'snap', text: 'in', ms: 280, size: 'god', lyric: 'in', art: hero, shot: 'close' },
    { cut: 'flashframe', text: '', ms: 70, size: 'sm', art: reelArt(r, 3, hero) },
    {
      cut: 'whoosh',
      text: '',
      ms: 220,
      size: 'sm',
      art: reelArt(r, 4, hero),
      shot: 'tilt',
      artB: reelArt(r, 1, hero),
      shotB: 'wide',
    },
    { cut: 'whip', text: "i'm locked in", ms: 520, size: 'god', lyric: "i'm locked in", art: hero, shot: 'close' },
    { cut: 'shake-hard', text: 'HEADLOCK', ms: 480, size: 'god', lyric: 'HEADLOCK', art: reelArt(r, 2, hero), shot: 'low' },
    { cut: 'lightleak', text: '', ms: 160, size: 'sm', art: reelArt(r, 2, hero), shot: 'low' },
    { cut: 'zoom-snap', text: 'HEADLOCK', ms: 380, size: 'god', lyric: 'HEADLOCK', art: reelArt(r, 2, hero), shot: 'close' },
    { cut: 'cliphold', text: '', ms: 680, size: 'sm', lyric: 'around my neck', clip: 'b', art: reelArt(r, 5, hero), shot: 'high' },
    {
      cut: 'perspective',
      text: 'around my neck',
      ms: 560,
      size: 'xl',
      lyric: 'around my neck',
      clip: 'b',
      art: reelArt(r, 5, hero),
      shot: 'close',
    },
    { cut: 'stutter', text: 'you', ms: 110, size: 'md', lyric: 'you', art: reelArt(r, 0, hero), shot: 'left' },
    { cut: 'stutter', text: 'can', ms: 110, size: 'md', lyric: 'can', art: reelArt(r, 1, hero), shot: 'right' },
    { cut: 'stutter', text: 'find', ms: 120, size: 'xl', lyric: 'find', art: reelArt(r, 3, hero), shot: 'close' },
    { cut: 'punchzoom', text: 'me', ms: 320, size: 'god', lyric: 'me', art: hero, shot: 'close' },
    { cut: 'collapse', text: '…', ms: 980, size: 'sm', lyric: '…', art: reelArt(r, 4, hero), shot: 'wide' },
    { cut: 'hold', text: '', ms: 320, size: 'sm', art: reelArt(r, 4, hero), shot: 'wide' },
    {
      cut: 'drop',
      text: 'HEADLOCK',
      ms: 620,
      size: 'god',
      lyric: 'HEADLOCK',
      art: hero,
      shot: 'close',
      artB: reelArt(r, 2, hero),
      shotB: 'tilt',
    },
    { cut: 'ae-shake', text: "i'm locked in", ms: 540, size: 'god', lyric: "i'm locked in", art: hero, shot: 'low' },
    { cut: 'glitch', text: '', ms: 140, size: 'sm', art: hero, shot: 'tilt' },
    { cut: 'vhs', text: '1/120', ms: 280, size: 'xl', lyric: 'one in one twenty', art: reelArt(r, 0, hero), shot: 'center' },
    {
      cut: 'cliphold',
      text: '1/120',
      ms: 620,
      size: 'xl',
      lyric: 'one in one twenty',
      clip: 'c',
      art: reelArt(r, 0, hero),
      shot: 'center',
    },
    { cut: 'glow', text: 'LEGENDARY', ms: 360, size: 'god', lyric: 'LEGENDARY', art: hero, shot: 'close' },
    { cut: 'slam', text: 'LEGENDARY', ms: 720, size: 'god', lyric: 'LEGENDARY', art: hero, shot: 'close' },
    { cut: 'flash', text: RARITY_META.legendary.label, ms: 560, size: 'god', lyric: '1/120', art: hero, shot: 'center' },
  ]
}

/** Romance AMV — soft multi-clip */
function buildRomanceAmvEdit(hero: string): Beat[] {
  const r = ROMANCE_REEL
  return [
    { cut: 'hold', text: '…', ms: 720, size: 'sm', clip: 'a', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'softzoom', text: 'wait', ms: 620, size: 'md', clip: 'a', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'cliphold', text: '', ms: 700, size: 'sm', clip: 'a', art: reelArt(r, 1, hero), shot: 'left' },
    { cut: 'bubble', text: 'BIRD', ms: 560, size: 'god', art: hero, shot: 'close' },
    { cut: 'blush', text: 'look', ms: 420, size: 'xl', art: reelArt(r, 2, hero), shot: 'high' },
    { cut: 'heart', text: '♡', ms: 400, size: 'god', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'bubble', text: 'at me', ms: 480, size: 'god', art: reelArt(r, 3, hero), shot: 'right' },
    { cut: 'cliphold', text: 'please', ms: 640, size: 'xl', clip: 'b', art: reelArt(r, 4, hero), shot: 'center' },
    { cut: 'whoosh', text: '', ms: 200, size: 'sm', art: reelArt(r, 5, hero), shot: 'tilt', artB: reelArt(r, 1, hero) },
    { cut: 'whip', text: 'SOFT', ms: 420, size: 'xl', art: hero, shot: 'close' },
    { cut: 'lightleak', text: '', ms: 180, size: 'sm', art: hero, shot: 'close' },
    { cut: 'shake-hard', text: 'STAY', ms: 460, size: 'god', art: reelArt(r, 2, hero), shot: 'low' },
    { cut: 'bubble', text: 'STAY', ms: 520, size: 'god', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'slowmo', text: 'don’t go', ms: 680, size: 'md', clip: 'c', art: reelArt(r, 3, hero), shot: 'wide' },
    { cut: 'collapse', text: '…', ms: 920, size: 'sm', art: reelArt(r, 1, hero), shot: 'wide' },
    { cut: 'drop', text: '♡ MYTHIC ♡', ms: 600, size: 'god', art: hero, shot: 'close' },
    { cut: 'glow', text: 'MYTHIC', ms: 360, size: 'god', art: hero, shot: 'close' },
    { cut: 'ae-shake', text: 'MYTHIC', ms: 480, size: 'god', art: hero, shot: 'center' },
    { cut: 'bubble', text: 'MYTHIC', ms: 640, size: 'god', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'slam', text: RARITY_META.mythic.label, ms: 680, size: 'god', art: hero, shot: 'close' },
  ]
}

/**
 * Mamacita — timed to ~26.4s Rarin [Edit audio] track.
 * Visual-only AE language (audio carries the song).
 */
function buildMamacitaEdit(hero: string): Beat[] {
  const r = MAMACITA_REEL
  return [
    { cut: 'hold', text: '', ms: 700, size: 'sm', lyric: '…', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'softzoom', text: '', ms: 850, size: 'sm', lyric: '…', clip: 'open', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'cliphold', text: '', ms: 900, size: 'sm', lyric: 'hey', clip: 'open', art: reelArt(r, 1, hero), shot: 'left' },
    { cut: 'whoosh', text: '', ms: 280, size: 'sm', art: reelArt(r, 2, hero), shot: 'tilt', artB: reelArt(r, 5, hero), shotB: 'wide' },
    { cut: 'flashframe', text: '', ms: 50, size: 'sm', art: reelArt(r, 6, hero) },
    { cut: 'stutter', text: 'MA', ms: 130, size: 'xl', lyric: 'ma', art: reelArt(r, 3, hero), shot: 'close' },
    { cut: 'stutter', text: 'MA', ms: 130, size: 'xl', lyric: 'ma', art: reelArt(r, 4, hero), shot: 'right' },
    { cut: 'ae-shake', text: 'CITA', ms: 460, size: 'god', lyric: 'cita', art: reelArt(r, 7, hero), shot: 'low' },
    { cut: 'whip', text: 'MAMACITA', ms: 620, size: 'god', lyric: 'mamacita', art: hero, shot: 'close', artB: reelArt(r, 2, hero), shotB: 'tilt' },
    { cut: 'risu-shake', text: 'MAMACITA', ms: 480, size: 'god', lyric: 'mamacita', art: reelArt(r, 1, hero), shot: 'close' },
    { cut: 'lightleak', text: '', ms: 180, size: 'sm', art: reelArt(r, 1, hero), shot: 'close' },
    { cut: 'zoom-snap', text: 'HEAT', ms: 420, size: 'god', lyric: 'heat', art: reelArt(r, 1, hero), shot: 'high' },
    { cut: 'cliphold', text: 'HEAT', ms: 780, size: 'god', lyric: 'heat', clip: 'heat', art: reelArt(r, 1, hero), shot: 'close' },
    { cut: 'slamzoom', text: '4K', ms: 400, size: 'xl', lyric: '4k', art: reelArt(r, 8, hero), shot: 'center' },
    { cut: 'rgb-split', text: '', ms: 160, size: 'sm', art: reelArt(r, 8, hero), shot: 'tilt' },
    { cut: 'flicker', text: '', ms: 180, size: 'sm', art: reelArt(r, 8, hero), shot: 'tilt' },
    { cut: 'velocity', text: 'SEND IT', ms: 480, size: 'xl', lyric: 'send it', art: reelArt(r, 9, hero), shot: 'close' },
    { cut: 'vhs', text: '', ms: 280, size: 'sm', art: reelArt(r, 9, hero), shot: 'wide' },
    { cut: 'whoosh', text: '', ms: 240, size: 'sm', art: reelArt(r, 6, hero), shot: 'tilt', artB: reelArt(r, 0, hero) },
    { cut: 'cliphold', text: '', ms: 520, size: 'sm', lyric: '…', clip: 'pre', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'collapse', text: '…', ms: 1200, size: 'sm', lyric: '…', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'hold', text: '', ms: 280, size: 'sm', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'flashframe', text: '', ms: 55, size: 'sm', art: hero },
    { cut: 'drop', text: 'MAMACITA', ms: 720, size: 'god', lyric: 'mamacita', art: hero, shot: 'close', artB: reelArt(r, 3, hero), shotB: 'tilt' },
    { cut: 'deepglow', text: 'MAMACITA', ms: 360, size: 'god', lyric: 'mamacita', art: hero, shot: 'close' },
    { cut: 'risu-shake', text: 'MAMACITA', ms: 500, size: 'god', lyric: 'mamacita', art: reelArt(r, 2, hero), shot: 'low' },
    { cut: 'punchzoom', text: '🧡', ms: 420, size: 'god', lyric: '🧡', art: reelArt(r, 5, hero), shot: 'close' },
    { cut: 'warp', text: '', ms: 160, size: 'sm', art: reelArt(r, 5, hero), shot: 'close' },
    { cut: 'cliphold', text: 'COOKED', ms: 780, size: 'god', lyric: 'cooked', clip: 'cooked', art: reelArt(r, 9, hero), shot: 'center' },
    { cut: 'stutter', text: 'NO', ms: 120, size: 'xl', lyric: 'no', art: reelArt(r, 7, hero), shot: 'left' },
    { cut: 'stutter', text: 'BRAKE', ms: 140, size: 'god', lyric: 'brake', art: reelArt(r, 8, hero), shot: 'right' },
    { cut: 'whip', text: 'NO BRAKE', ms: 520, size: 'god', lyric: 'no brake', art: hero, shot: 'close' },
    { cut: 'shake-hard', text: 'WRAAAP', ms: 480, size: 'god', lyric: 'wraaap', art: reelArt(r, 3, hero), shot: 'low' },
    { cut: 'flashframe', text: '', ms: 60, size: 'sm', art: reelArt(r, 1, hero) },
    { cut: 'vhs', text: 'AMV', ms: 320, size: 'xl', lyric: 'amv', art: reelArt(r, 4, hero), shot: 'high' },
    { cut: 'cliphold', text: 'AMV', ms: 560, size: 'xl', lyric: 'amv', clip: 'amv', art: reelArt(r, 4, hero), shot: 'high' },
    { cut: 'chromo', text: 'AMV', ms: 320, size: 'xl', lyric: 'amv', clip: 'amv', art: reelArt(r, 4, hero), shot: 'close' },
    { cut: 'velocity', text: 'HEAT', ms: 440, size: 'god', lyric: 'heat', art: reelArt(r, 1, hero), shot: 'close' },
    { cut: 'rgb-split', text: '', ms: 140, size: 'sm', art: reelArt(r, 2, hero), shot: 'tilt' },
    { cut: 'flicker', text: '', ms: 160, size: 'sm', art: reelArt(r, 2, hero), shot: 'tilt' },
    { cut: 'whoosh', text: '', ms: 220, size: 'sm', art: reelArt(r, 6, hero), shot: 'tilt', artB: reelArt(r, 5, hero) },
    { cut: 'zoom-snap', text: 'COOKED', ms: 480, size: 'god', lyric: 'cooked', art: reelArt(r, 9, hero), shot: 'close' },
    { cut: 'cliphold', text: '', ms: 500, size: 'sm', lyric: '…', clip: 'pre2', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'collapse', text: '…', ms: 1100, size: 'sm', lyric: '…', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'hold', text: '', ms: 220, size: 'sm', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'flashframe', text: '', ms: 55, size: 'sm', art: hero },
    { cut: 'drop', text: 'MAMACITA', ms: 700, size: 'god', lyric: 'mamacita', art: hero, shot: 'close', artB: reelArt(r, 2, hero), shotB: 'wide' },
    { cut: 'lightleak', text: '', ms: 180, size: 'sm', art: hero, shot: 'close' },
    { cut: 'shake-hard', text: 'HEAT DROP', ms: 500, size: 'god', lyric: 'heat drop', art: reelArt(r, 1, hero), shot: 'tilt' },
    { cut: 'whip', text: 'MAMACITA', ms: 520, size: 'god', lyric: 'mamacita', art: hero, shot: 'close' },
    { cut: 'deepglow', text: 'MAMACITA', ms: 400, size: 'god', lyric: 'mamacita', art: reelArt(r, 3, hero), shot: 'low' },
    { cut: 'risu-shake', text: 'MAMACITA', ms: 460, size: 'god', lyric: 'mamacita', art: reelArt(r, 3, hero), shot: 'low' },
    { cut: 'punchzoom', text: '🧡', ms: 380, size: 'god', lyric: '🧡', art: reelArt(r, 5, hero), shot: 'close' },
    { cut: 'vhs', text: 'WRAAAP', ms: 360, size: 'god', lyric: 'wraaap', art: reelArt(r, 0, hero), shot: 'center' },
    { cut: 'cliphold', text: 'WRAAAP', ms: 560, size: 'god', lyric: 'wraaap', clip: 'end', art: reelArt(r, 0, hero), shot: 'center' },
    { cut: 'velocity', text: 'NO BRAKE', ms: 400, size: 'xl', lyric: 'no brake', art: hero, shot: 'close' },
    { cut: 'stutter', text: 'EPIC', ms: 140, size: 'god', lyric: 'epic', art: reelArt(r, 4, hero), shot: 'right' },
    { cut: 'flashframe', text: '', ms: 60, size: 'sm', art: hero },
    { cut: 'slam', text: RARITY_META.epic.label, ms: 780, size: 'god', lyric: 'EPIC', art: hero, shot: 'close' },
    { cut: 'deepglow', text: 'MAMACITA', ms: 420, size: 'god', lyric: 'mamacita', art: hero, shot: 'close' },
    { cut: 'risu-shake', text: 'MAMACITA', ms: 480, size: 'god', lyric: 'mamacita', art: hero, shot: 'close' },
    { cut: 'flash', text: 'MAMACITA', ms: 820, size: 'god', lyric: 'MAMACITA', art: hero, shot: 'center' },
  ]
}

/**
 * Focuswater — Apple Motion Graphic video is primary;
 * CSS beats only as fallback if MP4 missing.
 */
function buildFocuswaterEdit(hero: string): Beat[] {
  return [
    { cut: 'hold', text: '', ms: 700, size: 'sm', lyric: '…', art: hero, shot: 'wide' },
    { cut: 'softzoom', text: 'FOCUS', ms: 900, size: 'xl', lyric: 'focus', art: hero, shot: 'close' },
    { cut: 'glow', text: 'WATER', ms: 700, size: 'god', lyric: 'water', art: hero, shot: 'center' },
    { cut: 'zoom-snap', text: 'FOCUSWATER', ms: 520, size: 'god', lyric: 'focuswater', art: hero, shot: 'close' },
    { cut: 'cliphold', text: 'WRAAAP', ms: 1100, size: 'god', lyric: 'wraaap', clip: 'wm', art: hero, shot: 'center' },
    { cut: 'lightleak', text: '', ms: 220, size: 'sm', art: hero, shot: 'tilt' },
    { cut: 'risu-shake', text: 'FOCUSWATER', ms: 480, size: 'god', lyric: 'focuswater', art: hero, shot: 'low' },
    { cut: 'deepglow', text: 'WATERMARK', ms: 640, size: 'god', lyric: 'watermark', art: hero, shot: 'close' },
    { cut: 'velocity', text: 'NO CAP', ms: 420, size: 'xl', lyric: 'no cap', art: hero, shot: 'close' },
    { cut: 'slam', text: 'EPIC', ms: 720, size: 'god', lyric: 'EPIC', art: hero, shot: 'center' },
    { cut: 'flash', text: 'FOCUSWATER', ms: 900, size: 'god', lyric: 'FOCUSWATER', art: hero, shot: 'center' },
  ]
}

function buildDivineEdit(hero: string): Beat[] {
  const r = DIVINE_REEL
  return [
    { cut: 'hold', text: '…', ms: 700, size: 'sm', clip: 'a', art: reelArt(r, 0, hero), shot: 'wide' },
    { cut: 'softzoom', text: 'wait', ms: 640, size: 'md', clip: 'a', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'cliphold', text: 'she looked', ms: 700, size: 'xl', clip: 'a', art: reelArt(r, 1, hero), shot: 'left' },
    { cut: 'blush', text: 'she looked', ms: 480, size: 'xl', art: reelArt(r, 2, hero), shot: 'high' },
    { cut: 'heart', text: '♡', ms: 420, size: 'god', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'bloom', text: 'подожди', ms: 520, size: 'xl', art: reelArt(r, 3, hero), shot: 'center' },
    { cut: 'softflash', text: 'blush', ms: 220, size: 'md', art: reelArt(r, 4, hero), shot: 'right' },
    { cut: 'cliphold', text: 'notice me', ms: 680, size: 'xl', clip: 'b', art: reelArt(r, 1, hero), shot: 'close' },
    { cut: 'sparkle', text: 'espresso', ms: 360, size: 'md', clip: 'b', art: reelArt(r, 1, hero), shot: 'high' },
    { cut: 'heart', text: '♡ ♡', ms: 400, size: 'god', art: hero, shot: 'close' },
    { cut: 'slowmo', text: 'don’t clip…', ms: 720, size: 'md', clip: 'c', art: reelArt(r, 2, hero), shot: 'wide' },
    { cut: 'collapse', text: '…', ms: 900, size: 'sm', art: reelArt(r, 3, hero), shot: 'wide' },
    { cut: 'drop', text: 'CLIP IT', ms: 520, size: 'god', art: hero, shot: 'close' },
    { cut: 'lightleak', text: '', ms: 160, size: 'sm', art: hero, shot: 'close' },
    { cut: 'punchzoom', text: '1/2500', ms: 420, size: 'xl', art: reelArt(r, 0, hero), shot: 'close' },
    { cut: 'shake-hard', text: '♡ ♡ ♡', ms: 460, size: 'god', art: reelArt(r, 1, hero), shot: 'tilt' },
    { cut: 'glow', text: 'ESPRESSO', ms: 360, size: 'god', art: hero, shot: 'close' },
    { cut: 'bloom', text: 'ESPRESSO', ms: 620, size: 'god', art: hero, shot: 'close' },
    { cut: 'slam', text: 'DIVINE', ms: 720, size: 'god', art: hero, shot: 'center' },
    { cut: 'softflash', text: RARITY_META.divine.label, ms: 560, size: 'god', art: hero, shot: 'close' },
  ]
}

export function DropCutscene({ card, onDone, forceEdit = 'auto' }: Props) {
  const preset = useMemo(() => resolvePreset(card, forceEdit), [card, forceEdit])
  const beats = useMemo(() => buildEdit(preset, card.rarity, card.art), [preset, card.rarity, card.art])
  const [index, setIndex] = useState(0)
  const [showCard, setShowCard] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [useVideo, setUseVideo] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoStartedRef = useRef(false)

  const isDivine = preset === 'divine'
  const isHeadlock = preset === 'headlock'
  const isRomance = preset === 'romance'
  const isMamacita = preset === 'mamacita'
  const isFocuswater = preset === 'focuswater'
  const isGod = isHeadlock || isRomance || isDivine || isMamacita || isFocuswater

  const audioTier =
    isFocuswater
      ? 'mamacita'
      : isMamacita
        ? 'mamacita'
        : isDivine
          ? 'divine'
          : isRomance
            ? 'mythic'
            : isHeadlock
              ? 'legendary'
              : 'normal'

  // Prefer rendered MP4 in public/edits/ (focuswater: always use bundled file)
  useEffect(() => {
    let cancelled = false
    setVideoReady(false)
    setUseVideo(false)
    setVideoSrc(null)
    setNeedsTap(false)
    videoStartedRef.current = false
    if (!isGod) {
      setVideoReady(true)
      return
    }
    if (isFocuswater) {
      const url = editVideoUrlDirect('focuswater')
      if (!cancelled && url) {
        setVideoSrc(url)
        setUseVideo(true)
      }
      if (!cancelled) setVideoReady(true)
      return
    }
    ;(async () => {
      const url = await probeEditVideo(preset)
      if (cancelled) return
      if (url) {
        setVideoSrc(url)
        setUseVideo(true)
      }
      setVideoReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [isGod, isFocuswater, preset])

  function startVideoPlayback(force = false) {
    const el = videoRef.current
    if (!el) return
    if (videoStartedRef.current && !force) return
    unlockGambleAudio()
    stopEditBed(0.05)
    el.muted = false
    if (el.currentTime < 0.05) el.currentTime = 0
    const play = el.play()
    if (play && typeof play.catch === 'function') {
      play
        .then(() => {
          videoStartedRef.current = true
          setNeedsTap(false)
        })
        .catch(() => {
          el.muted = true
          el.play()
            .then(() => {
              videoStartedRef.current = true
              if (isFocuswater) startEditBed('focuswater')
              setNeedsTap(true)
            })
            .catch(() => setUseVideo(false))
        })
    } else {
      videoStartedRef.current = true
      setNeedsTap(false)
    }
  }

  useEffect(() => {
    if (!videoReady) return
    // Soundtrack videos (incl. focuswater): no synth bed under the edit track.
    const wantBed = isGod && !useVideo
    unlockGambleAudio()
    if (wantBed && !isEditTrackPlaying()) {
      startEditBed(preset)
    }
    if (useVideo) {
      stopEditBed(0.05)
    }
    const session = ++editMountSession
    return () => {
      window.setTimeout(() => {
        if (editMountSession === session) stopEditBed(0.12)
      }, 60)
    }
  }, [isGod, isFocuswater, preset, videoReady, useVideo])

  const finishToCard = () => {
    if (showCard) return
    stopEditBed(0.12)
    if (isDivine) playDivineReveal()
    else if (isGod) playLegendaryReveal(isRomance || isMamacita || isFocuswater)
    window.setTimeout(() => setShowCard(true), isGod ? 220 : 80)
  }

  // Video path — wait for canplay, then start once
  useEffect(() => {
    if (!videoReady || useVideo || showCard) return
    if (index >= beats.length) {
      stopEditBed(0.12)
      if (isDivine) playDivineReveal()
      else if (isGod) playLegendaryReveal(isRomance || isMamacita || isFocuswater)
      const id = window.setTimeout(() => setShowCard(true), isGod ? 220 : 80)
      return () => window.clearTimeout(id)
    }
    const beat = beats[index]
    playCutBeat(beat.cut, audioTier)
    const id = window.setTimeout(() => setIndex((n) => n + 1), beat.ms)
    return () => window.clearTimeout(id)
  }, [
    index,
    beats,
    showCard,
    isGod,
    isDivine,
    isRomance,
    isMamacita,
    isFocuswater,
    audioTier,
    videoReady,
    useVideo,
  ])

  const beat = beats[Math.min(index, beats.length - 1)]
  const size = beat?.size || 'md'
  const artSrc = beat?.art || card.art
  const artKey = beat?.clip ? `clip-${beat.clip}-${artSrc}` : `img-${index}-${artSrc}`
  const shot = beat?.shot || 'center'
  const use3d =
    isHeadlock &&
    (beat?.cut === 'perspective' ||
      beat?.cut === 'headlock' ||
      beat?.cut === 'align' ||
      beat?.cut === 'velocity' ||
      beat?.cut === 'whip' ||
      beat?.cut === 'drop')
  const useBubble =
    isRomance &&
    (beat?.cut === 'bubble' || beat?.size === 'god' || beat?.cut === 'whip')
  const useImpact =
    isMamacita &&
    (beat?.size === 'god' ||
      beat?.cut === 'drop' ||
      beat?.cut === 'whip' ||
      beat?.cut === 'shake-hard' ||
      beat?.cut === 'risu-shake' ||
      beat?.cut === 'zoom-snap' ||
      beat?.cut === 'glow' ||
      beat?.cut === 'deepglow' ||
      beat?.cut === 'glitch' ||
      beat?.cut === 'vhs' ||
      beat?.cut === 'rgb-split')

  return (
    <div
      className={[
        'drop-cut',
        showCard ? 'has-card' : '',
        useVideo && !showCard ? 'is-video-edit' : '',
        !useVideo ? `cut-${beat?.cut || 'flash'}` : 'cut-hold',
        `rarity-${card.rarity}`,
        isGod ? 'is-god-edit' : '',
        isHeadlock ? 'is-legendary-edit is-headlock-edit' : '',
        isRomance ? 'is-mythic-edit is-romance-edit' : '',
        isDivine ? 'is-divine-edit' : '',
        isMamacita ? 'is-mamacita-edit' : '',
        isFocuswater ? 'is-focuswater-edit is-focuswater-fullscreen' : '',
        !useVideo && beat?.artB ? 'has-broll' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
    >
      {!showCard && useVideo && videoSrc ? (
        <div className="drop-cut-stage drop-cut-video-stage" aria-hidden>
          <video
            ref={videoRef}
            className="drop-cut-video"
            src={videoSrc}
            playsInline
            muted={false}
            preload="auto"
            onCanPlay={() => {
              if (!showCard && useVideo) startVideoPlayback()
            }}
            onEnded={finishToCard}
            onError={() => setUseVideo(false)}
          />
          {needsTap && (
            <button
              type="button"
              className="drop-cut-tap-play"
              onClick={() => {
                const el = videoRef.current
                if (el) {
                  el.muted = false
                  stopEditBed(0.08)
                  void el.play()
                }
                setNeedsTap(false)
                videoStartedRef.current = true
              }}
            >
              Tap to play · FOCUSWATER
            </button>
          )}
          <button
            type="button"
            className="drop-cut-skip"
            onClick={() => {
              try {
                videoRef.current?.pause()
              } catch {
                /* ignore */
              }
              finishToCard()
            }}
          >
            skip
          </button>
        </div>
      ) : null}

      {!showCard && !useVideo && videoReady ? (
        <div className="drop-cut-stage" aria-hidden>
          <div className="drop-cut-letterbox" />
          {isFocuswater ? (
            <div className="drop-cut-watermark" aria-hidden>
              <span>FOCUSWATER</span>
              <em>WRAAAP</em>
            </div>
          ) : null}
          {beat?.artB ? (
            <img
              key={`b-${artKey}`}
              src={beat.artB}
              alt=""
              className={`drop-cut-img drop-cut-img-b shot-${beat.shotB || 'wide'}`}
            />
          ) : null}
          <img key={artKey} src={artSrc} alt="" className={`drop-cut-img shot-${shot}`} />
          <div className="drop-cut-rgb" aria-hidden />
          <div className="drop-cut-impact" aria-hidden />
          <div className="drop-cut-hearts" aria-hidden>
            <span>♡</span>
            <span>♡</span>
            <span>♡</span>
            <span>🧡</span>
          </div>
          <p
            key={`txt-${index}`}
            className={`drop-cut-text size-${size} ${useBubble ? 'is-bubble' : ''} ${use3d ? 'is-3d' : ''} ${useImpact ? 'is-impact' : ''}`}
            data-text={beat?.text || ''}
          >
            {beat?.text}
          </p>
          {(isHeadlock || isMamacita) && beat?.lyric ? (
            <p key={`lyr-${index}`} className="drop-cut-lyric">
              {beat.lyric}
            </p>
          ) : null}
          <div className="drop-cut-noise" />
          <div className="drop-cut-vignette" />
          <div className="drop-cut-leak" aria-hidden />
          <div className="drop-cut-vhs" aria-hidden />
          <div className="drop-cut-bars">
            <i />
            <i />
            <i />
          </div>
          <div className="drop-cut-scan" />
          <div className="drop-cut-bloom" />
          <div className="drop-cut-glow" aria-hidden />
        </div>
      ) : null}

      {showCard && (
        <>
          <button type="button" className="drop-cut-dismiss" onClick={onDone}>
            tap to keep
          </button>
          <div className="drop-cut-cardwrap">
            <p className="drop-cut-new">
              NEW AURA · {RARITY_META[card.rarity].chanceLabel}
            </p>
            <WrapPokeCard card={card} reveal />
          </div>
        </>
      )}
    </div>
  )
}
