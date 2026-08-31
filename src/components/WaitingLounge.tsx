import { Suspense, lazy, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ORDERS_EVENT, ORDERS_KEY, type Order, type OrderStatus } from '../data/orders'
import { POLL_LIVE_MS, startOrdersPoll } from '../lib/pollOrders'
import {
  DROP_CARDS,
  INVENTORY_EVENT,
  WRAP_CURSOR_NEED,
  addToInventory,
  canReplayEdit,
  getCard,
  inventoryCounts,
  loadInventory,
  rollCard,
  shouldDropCard,
  uniqueWrapCount,
  type DropCard,
  type OwnedCard,
} from '../data/dropCards'
import {
  ACHIEVEMENT_DEFS,
  hasAchievement,
  syncAchievementCosmetics,
  unlockAchievement,
} from '../data/achievements'
import {
  formatLuckRemaining,
  getActiveLuck,
  loadChips,
  peekLuckBoost,
  redeemPromo,
  saveChips,
} from '../data/promoCodes'
import { resetLoungeCardProgress } from '../lib/resetWraaapProgress'
import { isPortalUnlocked } from '../lib/portalAuth'
import {
  playBust,
  playLeverPull,
  playReelLock,
  playReelTick,
  playReadyWin,
  playWin,
  silenceGambleAudio,
  stopSlotRoll,
  unlockGambleAudio,
} from '../lib/gambleAudio'
import { WrapPokeCard } from './WrapPokeCard'
import { OrderProgressBar } from './OrderProgressBar'
import { LoungeMusicPlayer } from './LoungeMusicPlayer'
import './WaitingLounge.css'

const DropCutscene = lazy(() =>
  import('./DropCutscene').then((m) => ({ default: m.DropCutscene })),
)

const SYMBOLS = ['🌯', '🌶️', '🥑', '🌽', '🥬', '🍅', '🧅', '💥', '⭐', '💀'] as const
type Symbol = (typeof SYMBOLS)[number]

type Props = {
  orderId?: string | null
  onHome: () => void
  onOrderAgain: () => void
}

function rngInt(max: number) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] % max
  }
  return Math.floor(Math.random() * max)
}

function pickSymbol(): Symbol {
  return SYMBOLS[rngInt(SYMBOLS.length)]
}

function payout(a: Symbol, b: Symbol, c: Symbol, bet: number) {
  if (a === b && b === c) {
    if (a === '⭐') {
      return { label: 'JACKPOT ★★★', win: bet * 12, kind: 'jackpot' as const }
    }
    if (a === '💥' || a === '🌶️') {
      return { label: 'HEAT TRIPLE', win: bet * 10, kind: 'triple' as const }
    }
    if (a === '💀') {
      return { label: 'DEATH TRIPLE · house laughs', win: bet * 3, kind: 'triple' as const }
    }
    return { label: 'TRIPLE HIT', win: bet * 8, kind: 'triple' as const }
  }
  if (a === b || b === c || a === c) {
    return { label: 'PAIR', win: bet * 2, kind: 'pair' as const }
  }
  if ([a, b, c].includes('🌶️') || [a, b, c].includes('💥')) {
    return {
      label: 'HEAT NUDGE',
      win: Math.max(1, Math.floor(bet * 0.5)),
      kind: 'nudge' as const,
    }
  }
  return { label: 'BUST', win: 0, kind: 'bust' as const }
}

function readyDismissKey(orderId: string) {
  return `wraaap-ready-dismissed-${orderId}`
}

function isReadyDismissed(orderId: string) {
  try {
    return sessionStorage.getItem(readyDismissKey(orderId)) === '1'
  } catch {
    return false
  }
}

function dismissReadyNotice(orderId: string) {
  try {
    sessionStorage.setItem(readyDismissKey(orderId), '1')
  } catch {
    /* ignore */
  }
}

function pushReadyNotification(order: Order) {
  if (typeof window === 'undefined') return
  try {
    navigator.vibrate?.([120, 60, 120])
  } catch {
    /* ignore */
  }
  if (typeof Notification === 'undefined') return
  const title = 'WRAAAP · wrap ready'
  const body = `${order.customer.name || 'Guest'} · ${order.id} — grab your wrap`
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' })
    return
  }
  if (Notification.permission !== 'denied') {
    void Notification.requestPermission().then((perm) => {
      if (perm === 'granted') new Notification(title, { body, icon: '/favicon.svg' })
    })
  }
}

export function WaitingLounge({ orderId, onHome, onOrderAgain }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [chips, setChips] = useState(() => loadChips())
  const [promo, setPromo] = useState('')
  const [promoMsg, setPromoMsg] = useState<string | null>(null)
  const [luckLeftMs, setLuckLeftMs] = useState(() => getActiveLuck().remainingMs)
  const [luckMult, setLuckMult] = useState(() => getActiveLuck().mult)
  const [reels, setReels] = useState<[Symbol, Symbol, Symbol]>(['🌯', '🥑', '🌶️'])
  const [spinning, setSpinning] = useState(false)
  const [leverDown, setLeverDown] = useState(false)
  const [locked, setLocked] = useState<[boolean, boolean, boolean]>([true, true, true])
  const [result, setResult] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [bet, setBet] = useState(5)
  const [owned, setOwned] = useState<OwnedCard[]>(() => loadInventory())
  const [reveal, setReveal] = useState<DropCard | null>(null)
  const [achievement, setAchievement] = useState<string | null>(null)
  const [wrapCursorOn, setWrapCursorOn] = useState(() => hasAchievement('wrap-cursor'))
  const [pendingAch, setPendingAch] = useState(false)
  const [readyNotice, setReadyNotice] = useState(false)
  const timers = useRef<number[]>([])
  const blurRef = useRef<number | null>(null)
  const prevStatusRef = useRef<OrderStatus | null>(null)

  useEffect(() => {
    syncAchievementCosmetics()
    void import('./DropCutscene')
  }, [])

  useEffect(() => {
    const tick = () => {
      const active = getActiveLuck()
      setLuckLeftMs(active.remainingMs)
      setLuckMult(active.mult)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const syncFromCache = () => {
      void import('../data/orders').then(({ loadOrders }) => {
        setOrder(loadOrders().find((item) => item.id === orderId) || null)
      })
    }
    syncFromCache()
    const onStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY || event.key === null) syncFromCache()
    }
    window.addEventListener(ORDERS_EVENT, syncFromCache)
    window.addEventListener('storage', onStorage)
    const stop = startOrdersPoll((list) => {
      setOrder(list.find((item) => item.id === orderId) || null)
    }, POLL_LIVE_MS)
    return () => {
      window.removeEventListener(ORDERS_EVENT, syncFromCache)
      window.removeEventListener('storage', onStorage)
      stop()
    }
  }, [orderId])

  useEffect(() => {
    if (!order || !orderId) {
      prevStatusRef.current = null
      setReadyNotice(false)
      return
    }

    const prev = prevStatusRef.current
    const next = order.status
    prevStatusRef.current = next

    if (next === 'fertig') {
      if (prev !== null && prev !== 'fertig') {
        unlockGambleAudio()
        playReadyWin()
        pushReadyNotification(order)
      }
      if (!isReadyDismissed(orderId)) {
        setReadyNotice(true)
      }
    } else {
      setReadyNotice(false)
    }
  }, [order, orderId])

  function closeReadyNotice() {
    if (orderId) dismissReadyNotice(orderId)
    setReadyNotice(false)
  }

  useEffect(() => {
    const syncCards = () => setOwned(loadInventory())
    window.addEventListener(INVENTORY_EVENT, syncCards)
    return () => window.removeEventListener(INVENTORY_EVENT, syncCards)
  }, [])

  useEffect(() => {
    silenceGambleAudio()
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      if (blurRef.current) window.clearTimeout(blurRef.current)
      stopSlotRoll()
      silenceGambleAudio()
    }
  }, [])

  const statusLabel = useMemo(() => {
    if (!order) return 'ticket in the void'
    if (order.status === 'neu') return 'queued · kitchen staring'
    if (order.status === 'in_arbeit') return 'on the line · heat up'
    return 'done · grab your wrap'
  }, [order])

  const ticketKicker = useMemo(() => {
    if (!order) return 'waiting on a ticket'
    if (order.status === 'fertig') return 'your wrap is done'
    if (order.status === 'in_arbeit') return 'your wrap is cooking'
    return 'your wrap is queued'
  }, [order])

  const ticketClass = useMemo(() => {
    if (!order) return 'is-void'
    if (order.status === 'fertig') return 'is-ready'
    if (order.status === 'in_arbeit') return 'is-cooking'
    return 'is-queued'
  }, [order])

  const counts = useMemo(() => inventoryCounts(owned), [owned])
  const wrapCount = useMemo(() => uniqueWrapCount(owned), [owned])

  function setChipBalance(next: number | ((n: number) => number)) {
    setChips((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      saveChips(value)
      return value
    })
  }

  function applyPromo(event: FormEvent) {
    event.preventDefault()
    const result = redeemPromo(promo)
    setPromoMsg(result.message)
    if (result.ok && typeof result.nextBalance === 'number') {
      setChips(result.nextBalance)
      setPromo('')
    }
    if (result.ok && typeof result.luckRemainingMs === 'number') {
      setLuckLeftMs(result.luckRemainingMs)
      if (typeof result.luckBoost === 'number') setLuckMult(result.luckBoost)
    }
  }

  function playEdit(cardId: string) {
    if (!isPortalUnlocked('admin')) return
    if (spinning || reveal || achievement) return
    unlockGambleAudio()
    const card = getCard(cardId)
    if (!card) return
    // Admin preview only — does not grant collection or replay
    void import('./DropCutscene').finally(() => setReveal(card))
  }

  function replayOwnedCard(card: DropCard) {
    if (spinning || reveal || achievement) return
    if (!canReplayEdit(owned, card)) return
    unlockGambleAudio()
    setReveal(card)
  }

  function maybeUnlockWrapCursor(nextOwned: OwnedCard[]) {
    if (uniqueWrapCount(nextOwned) < WRAP_CURSOR_NEED) return
    const { unlocked } = unlockAchievement('wrap-cursor')
    if (!unlocked) return
    syncAchievementCosmetics()
    setWrapCursorOn(true)
    setPendingAch(true)
  }

  function closeReveal() {
    setReveal(null)
    if (pendingAch) {
      setPendingAch(false)
      window.setTimeout(() => {
        setAchievement(ACHIEVEMENT_DEFS['wrap-cursor'].title)
      }, 200)
    }
  }

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
    if (blurRef.current) {
      window.clearInterval(blurRef.current)
      blurRef.current = null
    }
    stopSlotRoll()
  }

  function pullArm() {
    if (spinning || chips < bet || reveal || achievement) return
    clearTimers()
    unlockGambleAudio()
    playLeverPull()
    setSpinning(true)
    setLeverDown(true)
    setResult(null)
    setLocked([false, false, false])
    setChipBalance((n) => n - bet)

    const final: [Symbol, Symbol, Symbol] = [pickSymbol(), pickSymbol(), pickSymbol()]
    const lockMask = [false, false, false]
    let tickPhase = 0

    const scheduleBlur = (gap: number) => {
      blurRef.current = window.setTimeout(() => {
        tickPhase += 1
        const lockedCount = lockMask.filter(Boolean).length
        // denser early, slows as reels lock — classic slot roll
        playReelTick(lockedCount * 0.28 + (tickPhase % 6) * 0.04)
        setReels(
          [0, 1, 2].map((index) => (lockMask[index] ? final[index] : pickSymbol())) as [
            Symbol,
            Symbol,
            Symbol,
          ],
        )
        const nextGap = 28 + lockedCount * 22 + Math.min(40, tickPhase)
        scheduleBlur(nextGap)
      }, gap)
    }
    scheduleBlur(28)

    ;[720, 1240, 1780].forEach((ms, index) => {
      const id = window.setTimeout(() => {
        lockMask[index] = true
        playReelLock(index)
        setLocked((prev) => {
          const next = [...prev] as [boolean, boolean, boolean]
          next[index] = true
          return next
        })
        setReels((prev) => {
          const next = [...prev] as [Symbol, Symbol, Symbol]
          next[index] = final[index]
          return next
        })

        if (index === 2) {
          if (blurRef.current) {
            window.clearTimeout(blurRef.current)
            blurRef.current = null
          }
          setReels(final)
          const { label, win, kind } = payout(final[0], final[1], final[2], bet)
          setChipBalance((n) => n + win)
          const line = `${final.join('')} · ${label} · +${win}`
          setResult(line)
          setHistory((prev) => [line, ...prev].slice(0, 8))
          setSpinning(false)
          window.setTimeout(() => setLeverDown(false), 180)

          const luck = peekLuckBoost()
          const dropCard = shouldDropCard(kind, luck)

          if (dropCard) {
            const card = rollCard(luck)
            const nextOwned = addToInventory(card.id, luck > 1 ? 'guaranteed' : kind)
            setOwned(nextOwned)
            window.setTimeout(() => {
              // Cutscene owns edit audio — don't start bed here (doubles under video edits)
              unlockGambleAudio()
              setReveal(card)
            }, 280)
            maybeUnlockWrapCursor(nextOwned)
          } else if (kind === 'bust') {
            playBust()
          } else {
            playWin(kind)
          }
        }
      }, ms)
      timers.current.push(id)
    })
  }

  return (
    <div className={`lounge ${order?.status === 'fertig' ? 'lounge-order-ready' : ''}`}>
      <div className="lounge-noise" aria-hidden />
      <header className="lounge-top">
        <div className="lounge-top-left">
          <button type="button" className="lounge-brand" onClick={onHome}>
            WRAAAP
          </button>
        </div>
        <p className="lounge-stamp">WAIT · LOUNGE</p>
        <div className="lounge-top-right">
          <button type="button" className="lounge-ghost" onClick={onOrderAgain}>
            Order again
          </button>
        </div>
      </header>

      <LoungeMusicPlayer />

      {readyNotice && order?.status === 'fertig' && (
        <div className="lounge-ready-toast" role="alertdialog" aria-live="assertive" aria-labelledby="lounge-ready-title">
          <button type="button" className="lounge-ready-toast-close" onClick={closeReadyNotice} aria-label="Close notification">
            ×
          </button>
          <div className="lounge-ready-toast-body">
            <strong id="lounge-ready-title">WRAP READY</strong>
            <span>
              {order.customer.name || 'Guest'} · {orderId} — pick it up
            </span>
          </div>
          <button type="button" className="lounge-ready-toast-ok" onClick={closeReadyNotice}>
            OK
          </button>
        </div>
      )}

      <main className="lounge-main">
        <section className={`lounge-ticket ${ticketClass}`}>
          <p>{ticketKicker}</p>
          <h1>{order?.customer.name || 'Guest'}</h1>
          <strong className="lounge-id">{orderId || '—'}</strong>
          <OrderProgressBar status={order?.status} variant="lounge" />
          <p className="lounge-live" aria-live="polite">
            {order ? 'live · updates every few seconds' : 'waiting for ticket sync…'}
          </p>
          <em className="lounge-status">{statusLabel}</em>
          <ul>
            {(order?.wrapDesign?.layerLabels || order?.items.map((i) => i.name) || []).map(
              (label) => (
                <li key={label}>{label}</li>
              ),
            )}
          </ul>
          <p className="lounge-hint">
            einarmiger bandit · Sol RNG drops · fake chips · rare hits = cards
          </p>
        </section>

        <section className="lounge-table" aria-label="Einarmiger Bandit">
          <div className="lounge-bank">
            <span>CHIPS</span>
            <strong>{chips}</strong>
          </div>

          <form className="lounge-promo" onSubmit={applyPromo}>
            <label>
              PROMO
              <input
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                placeholder="EDIT / WRAAAP / …"
                disabled={spinning || !!reveal}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <button type="submit" disabled={spinning || !!reveal || !promo.trim()}>
              Redeem
            </button>
            {promoMsg && <p>{promoMsg}</p>}
            {luckLeftMs > 0 && luckMult > 1 && (
              <p className="lounge-edit-lock">
                {luckMult}× luck · {formatLuckRemaining(luckLeftMs)} left
              </p>
            )}
          </form>

          <div className="bandit">
            <p className="bandit-title">ONE-ARM BANDIT</p>
            <div className="bandit-body">
              <div className={`bandit-window ${spinning ? 'spinning' : ''}`}>
                {reels.map((symbol, index) => (
                  <div
                    key={index}
                    className={`bandit-cell ${locked[index] ? 'locked' : 'rolling'}`}
                  >
                    <span className="bandit-face">{symbol}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`bandit-arm ${leverDown ? 'down' : ''}`}
                onClick={pullArm}
                disabled={spinning || chips < bet || !!reveal}
                aria-label="Hebel ziehen"
              >
                <span className="bandit-arm-knob" />
                <span className="bandit-arm-shaft" />
              </button>
            </div>

            <div className="lounge-bets">
              {[5, 10, 20].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={bet === value ? 'active' : ''}
                  onClick={() => setBet(value)}
                  disabled={spinning || !!reveal}
                >
                  Bet {value}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="lounge-pull"
              onClick={pullArm}
              disabled={spinning || chips < bet || !!reveal}
            >
              {spinning ? 'REELS…' : 'PULL THE ARM'}
            </button>
          </div>

          {result && <p className="lounge-result">{result}</p>}

          <div className="lounge-history">
            <p>paytable · ★★★ jackpot · pair 2× · rare hit → card drop</p>
            <ul>
              {history.length === 0 && <li>no scars yet — pull the arm</li>}
              {history.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lounge-dex" aria-label="Card collection">
          <header>
            <p>COLLECTION</p>
            <strong>
              {counts.size}/{DROP_CARDS.length} auras
            </strong>
            <button
              type="button"
              className="lounge-reset-cards"
              onClick={() => {
                if (!window.confirm('Lounge-Karten & Achievements zurücksetzen? Chips bleiben.')) return
                resetLoungeCardProgress()
                window.location.reload()
              }}
            >
              Reset cards
            </button>
          </header>

          <div className={`lounge-ach ${wrapCursorOn ? 'done' : ''}`}>
            <div>
              <em>ACHIEVEMENT</em>
              <strong>Wrap Cursor</strong>
              <span>
                {wrapCursorOn
                  ? 'Unlocked · your mouse is a wrap'
                  : `${Math.min(wrapCount, WRAP_CURSOR_NEED)}/${WRAP_CURSOR_NEED} unique wrap auras`}
              </span>
            </div>
            <div className="lounge-ach-bar" aria-hidden>
              <i style={{ width: `${Math.min(100, (wrapCount / WRAP_CURSOR_NEED) * 100)}%` }} />
            </div>
          </div>

          {isPortalUnlocked('admin') && (
            <div className="lounge-edits">
              <p>EDIT PREVIEW · admin only</p>
              <div className="lounge-edit-row">
                <button type="button" onClick={() => playEdit('garden-glow')} disabled={!!reveal}>
                  HEADLOCK
                  <span>legendary lyric AE</span>
                </button>
                <button type="button" onClick={() => playEdit('classic-myth')} disabled={!!reveal}>
                  BIRD
                  <span>mythic romance AMV</span>
                </button>
                <button type="button" onClick={() => playEdit('espresso-notice')} disabled={!!reveal}>
                  ESPRESSO
                  <span>divine blush edit</span>
                </button>
                <button type="button" onClick={() => playEdit('sunset-omen')} disabled={!!reveal}>
                  MAMACITA
                  <span>Masha heat AMV</span>
                </button>
                <button type="button" onClick={() => playEdit('focus-water')} disabled={!!reveal}>
                  FOCUSWATER
                  <span>Apple motion · watermark</span>
                </button>
              </div>
            </div>
          )}

          <div className="lounge-dex-grid">
            {DROP_CARDS.map((card) => {
              const count = counts.get(card.id) || 0
              const unlocked = count > 0
              const canReplay = canReplayEdit(owned, card)
              const replayHint = canReplay
                ? 'tap to replay cutscene'
                : unlocked
                  ? 'roll this edit on the bandit to unlock replay'
                  : undefined
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`lounge-dex-card ${canReplay ? 'can-replay' : ''}`}
                  onClick={() => replayOwnedCard(card)}
                  disabled={!canReplay || !!reveal}
                  title={replayHint}
                >
                  <WrapPokeCard
                    card={card}
                    owned={unlocked}
                    locked={!unlocked}
                    count={count}
                  />
                </button>
              )
            })}
          </div>
        </section>
      </main>

      {reveal && (
        <Suspense fallback={<div className="lounge-cutscene-boot">… edit loading …</div>}>
          <DropCutscene card={reveal} onDone={closeReveal} />
        </Suspense>
      )}

      {achievement && (
        <div className="ach-reveal" role="dialog" aria-modal="true">
          <button type="button" className="card-reveal-dismiss" onClick={() => setAchievement(null)}>
            tap to equip cursor
          </button>
          <div className="ach-card">
            <p>ACHIEVEMENT UNLOCKED</p>
            <strong>{achievement}</strong>
            <span>{ACHIEVEMENT_DEFS['wrap-cursor'].blurb}</span>
            <em>cursor is now a wrap · site-wide</em>
          </div>
        </div>
      )}
    </div>
  )
}
