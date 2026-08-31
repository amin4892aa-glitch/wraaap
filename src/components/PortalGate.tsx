import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { isPortalUnlocked, setPortalUnlocked, type GatedPortal } from '../lib/portalAuth'
import './PortalGate.css'

type Props = {
  portal: GatedPortal
  title: string
  hint: string
  password: string
  onHome: () => void
  children: ReactNode
}

export function PortalGate({ portal, title, hint, password, onHome, children }: Props) {
  const [unlocked, setUnlocked] = useState(() => isPortalUnlocked(portal))
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setUnlocked(isPortalUnlocked(portal))
    setValue('')
    setError(false)
  }, [portal])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (value.trim() === password) {
      setPortalUnlocked(portal, true)
      setUnlocked(true)
      setError(false)
      return
    }
    setError(true)
  }

  function lock() {
    setPortalUnlocked(portal, false)
    setUnlocked(false)
    setValue('')
  }

  if (unlocked) {
    return (
      <div className="gate-open">
        <button type="button" className="gate-lock" onClick={lock}>
          Lock
        </button>
        {children}
      </div>
    )
  }

  return (
    <div className="gate">
      <button type="button" className="gate-back" onClick={onHome}>
        WRAAAP ©2026
      </button>
      <form className="gate-card" onSubmit={submit}>
        <p className="gate-kicker">Restricted</p>
        <h1>{title}</h1>
        <p className="gate-lede">{hint}</p>
        <label>
          Password
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError(false)
            }}
            placeholder="••••••••"
          />
        </label>
        {error && <p className="gate-error">Wrong password.</p>}
        <button type="submit">Enter</button>
      </form>
    </div>
  )
}
