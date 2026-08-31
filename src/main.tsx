import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const bootAchievements = () => {
  void import('./data/achievements').then(({ syncAchievementCosmetics }) => {
    syncAchievementCosmetics()
  })
}

if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(bootAchievements)
} else {
  globalThis.setTimeout(bootAchievements, 1)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
