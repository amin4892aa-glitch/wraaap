import { useRef, useState } from 'react'
import './LoungeMusicPlayer.css'

const TRACK = 'music/thats-a-wrap.mp3'

function trackUrl() {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${TRACK}`
}

export function LoungeMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.72)

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }
    el.volume = volume
    void el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  function onVolume(next: number) {
    setVolume(next)
    if (audioRef.current) audioRef.current.volume = next
  }

  return (
    <div className="lounge-music">
      <audio ref={audioRef} src={trackUrl()} loop preload="metadata" onPause={() => setPlaying(false)} />
      <button
        type="button"
        className={`lounge-music-play ${playing ? 'is-playing' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
      <div className="lounge-music-meta">
        <strong>That&apos;s A Wrap</strong>
        <span>Disco Funk · lounge mix</span>
      </div>
      <label className="lounge-music-vol">
        <span>Vol</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => onVolume(Number(event.target.value))}
        />
      </label>
    </div>
  )
}
