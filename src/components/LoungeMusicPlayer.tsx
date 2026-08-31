import { useRef, useState } from 'react'
import { THATS_A_WRAP_LYRICS } from '../data/thatsAWrapLyrics'
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
  const [lyricsOpen, setLyricsOpen] = useState(false)

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
    <div className={`lounge-music ${playing ? 'is-playing' : ''} ${lyricsOpen ? 'is-open' : ''}`}>
      <audio ref={audioRef} src={trackUrl()} loop preload="metadata" onPause={() => setPlaying(false)} />

      <div className="lounge-music-deck">
        <div className="lounge-music-platter">
          <span className="lounge-music-arm" aria-hidden />
          <button
            type="button"
            className="lounge-music-vinyl"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? 'Pause That\u2019s A Wrap' : 'Play That\u2019s A Wrap'}
          >
            <span className="lounge-music-vinyl-disc" aria-hidden>
              <span className="lounge-music-vinyl-grooves" />
              <span className="lounge-music-vinyl-shine" />
              <span className="lounge-music-vinyl-label">
                <span className="lounge-music-vinyl-label-brand">WRAAAP</span>
                <span className="lounge-music-vinyl-label-title">That&apos;s A Wrap</span>
                <span className="lounge-music-vinyl-label-sub">Disco Funk · 45</span>
              </span>
              <span className="lounge-music-vinyl-hole" />
            </span>
          </button>
        </div>

        <div className="lounge-music-panel">
          <div className="lounge-music-meta">
            <strong>That&apos;s A Wrap</strong>
            <span>{playing ? 'Now spinning' : 'Tap record to play'}</span>
          </div>
          <div className="lounge-music-actions">
            <button
              type="button"
              className={`lounge-music-lyrics-btn ${lyricsOpen ? 'is-open' : ''}`}
              onClick={() => setLyricsOpen((open) => !open)}
              aria-expanded={lyricsOpen}
            >
              Lyrics
            </button>
            <span className="lounge-music-badge">{playing ? 'ON AIR' : 'STBY'}</span>
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
      </div>

      {lyricsOpen && (
        <div className="lounge-music-lyrics">
          <p className="lounge-music-lyrics-kicker">Lyrics</p>
          {THATS_A_WRAP_LYRICS.map((section) => (
            <section key={section.title + section.lines[0]}>
              <h3>[{section.title}]</h3>
              {section.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
