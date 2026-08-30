import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import './PortalGate.css'

type Props = {
  portal: 'kueche' | 'admin'
  title: string
  hint: string
  password: string
  onHome: () => void
  children: ReactNode
}

function storageKey(portal: string) {
  return `wraaap-auth-${portal}`
}

export function PortalGate({ portal, title, hint, password, onHome, children }: Props) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(storageKey(portal)) === '1')
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(storageKey(portal)) === '1')
    setValue('')
    setError(false)
  }, [portal])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (value.trim() === password) {
      sessionStorage.setItem(storageKey(portal), '1')
      setUnlocked(true)
      setError(false)
      return
    }
    setError(true)
  }

  function lock() {
    sessionStorage.removeItem(storageKey(portal))
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
