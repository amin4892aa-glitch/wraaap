import { Suspense, useEffect, useMemo, useState } from 'react'
import { StyleWrapScene, WRAP_PAINTS, type WrapPaint } from './StyleWrapScene'
import './StyleExperience.css'

type Props = {
  onBudget: () => void
  onKitchen: () => void
}

export function StyleExperience({ onBudget, onKitchen }: Props) {
  const [paint, setPaint] = useState<WrapPaint>(WRAP_PAINTS[0])
  const [motion, setMotion] = useState(false)
  const [holding, setHolding] = useState(false)
  const [coords, setCoords] = useState({ x: 46.9897752, y: 33.28736 })

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      setCoords({
        x: 40 + (event.clientX / window.innerWidth) * 20,
        y: 28 + (event.clientY / window.innerHeight) * 14,
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const stamp = useMemo(() => new Date().toLocaleTimeString('de-CH', { hour12: false }), [])

  return (
    <section className={`style-exp ${holding ? 'is-hold' : ''}`}>
      <div className="style-stage">
        <Suspense fallback={<div className="style-loading">… Now Loading …</div>}>
          <StyleWrapScene paint={paint} motion={motion && !holding} />
        </Suspense>
      </div>

      <div className="style-hud">
        <header className="style-top">
          <div className="style-brand-box">WRAAAP : LABS</div>
          <div className="style-top-actions">
            <button type="button" onClick={onBudget}>
              BUDGET
            </button>
            <button type="button" onClick={onKitchen}>
              KÜCHE
            </button>
          </div>
        </header>

        <p className="style-side-label">
          <i />
          {motion ? 'IN MOTION' : 'IN STYLE'}
        </p>

        <div className="style-mode-switch">
          <button
            type="button"
            className={!motion ? 'active' : ''}
            onClick={() => setMotion(false)}
          >
            In Style
          </button>
          <button
            type="button"
            className={motion ? 'active' : ''}
            onClick={() => setMotion(true)}
          >
            In Motion
          </button>
        </div>

        <div className="style-meta-left">
          <span>WRAP</span>
          <strong>{paint.label}</strong>
          <em>REC EN · {stamp}</em>
        </div>

        <div className="style-meta-right">
          <span>{coords.x.toFixed(7)}</span>
          <span>{coords.y.toFixed(7)}</span>
          <em>WRAAAP</em>
        </div>

        <button
          type="button"
          className="style-hold"
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
        >
          Hold
        </button>

        <div className="style-swatches" role="listbox" aria-label="Wrap Farbe">
          {WRAP_PAINTS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={paint.id === item.id}
              className={paint.id === item.id ? 'active' : ''}
              style={{ background: item.shell }}
              title={item.label}
              onClick={() => setPaint(item)}
            />
          ))}
        </div>

        <p className="style-caption">
          One wrap, two visuals — contrast of motion and style.
        </p>
      </div>
    </section>
  )
}
