import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LOUNGE_TRACKS,
  activeLyricIndex,
  getLoungeTrack,
  lyricSections,
} from '../data/loungeTracks'
import './LoungeMusicPlayer.css'

function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

export function LoungeMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Map<number, HTMLParagraphElement>>(new Map())
  const [trackId, setTrackId] = useState(LOUNGE_TRACKS[0].id)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.72)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const track = useMemo(() => getLoungeTrack(trackId), [trackId])
  const activeIndex = useMemo(
    () => activeLyricIndex(track.lyrics, currentTime),
    [track.lyrics, currentTime],
  )
  const sections = useMemo(() => lyricSections(track.lyrics), [track.lyrics])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.src = assetUrl(track.src)
    el.load()
    setPlaying(false)
    setCurrentTime(0)
  }, [track.src])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = volume
  }, [volume])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = () => {
      const el = audioRef.current
      if (el) setCurrentTime(el.currentTime)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  useEffect(() => {
    if (!lyricsOpen || activeIndex < 0) return
    const node = lineRefs.current.get(activeIndex)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeIndex, lyricsOpen])

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

  function toggleLyrics() {
    setLyricsOpen((open) => !open)
  }

  function onVolume(next: number) {
    setVolume(next)
    if (audioRef.current) audioRef.current.volume = next
  }

  function onTrackChange(nextId: string) {
    if (nextId === trackId) return
    setTrackId(nextId)
  }

  function onTimeUpdate() {
    const el = audioRef.current
    if (!el) return
    setCurrentTime(el.currentTime)
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`lounge-music ${playing ? 'is-playing' : ''} ${lyricsOpen ? 'is-open' : ''}`}>
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onSeeked={onTimeUpdate}
      />

      <div className="lounge-music-deck">
        <button
          type="button"
          className="lounge-music-sleeve"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <span className="lounge-music-sleeve-art" aria-hidden>
            <img src={assetUrl('favicon.svg')} alt="" />
          </span>
          <span className="lounge-music-sleeve-title">{track.title}</span>
          <span className="lounge-music-sleeve-sub">{track.subtitle}</span>
        </button>

        <div className="lounge-music-platter">
          <span className="lounge-music-arm" aria-hidden />
          <button
            type="button"
            className="lounge-music-vinyl"
            onClick={toggle}
            aria-pressed={playing}
            aria-label={playing ? 'Pause record' : 'Play record'}
          >
            <span className="lounge-music-vinyl-disc" aria-hidden>
              <span className="lounge-music-vinyl-grooves" />
              <span className="lounge-music-vinyl-shine" />
              <span className="lounge-music-vinyl-label">
                <span className="lounge-music-vinyl-label-title">{track.title}</span>
                <span className="lounge-music-vinyl-label-sub">45 RPM</span>
              </span>
              <span className="lounge-music-vinyl-hole" />
            </span>
          </button>
          <button
            type="button"
            className="lounge-music-logo"
            onClick={toggleLyrics}
            aria-expanded={lyricsOpen}
            aria-label="Toggle lyrics"
          >
            WRAAAP
          </button>
        </div>

        <div className="lounge-music-panel">
          <label className="lounge-music-track-pick">
            <span>Track</span>
            <select value={trackId} onChange={(event) => onTrackChange(event.target.value)}>
              {LOUNGE_TRACKS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · {item.subtitle}
                </option>
              ))}
            </select>
          </label>
          <div className="lounge-music-meta">
            <strong>{track.title}</strong>
            <span>
              {playing ? 'Now spinning' : 'Tap sleeve or record'} · {formatTime(currentTime)}
            </span>
          </div>
          <div className="lounge-music-actions">
            <button
              type="button"
              className={`lounge-music-lyrics-btn ${lyricsOpen ? 'is-open' : ''}`}
              onClick={toggleLyrics}
              aria-expanded={lyricsOpen}
              disabled={!track.lyrics.length}
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

      {lyricsOpen && track.lyrics.length > 0 && (
        <div className="lounge-music-lyrics" ref={lyricsRef}>
          <p className="lounge-music-lyrics-kicker">Lyrics · synced</p>
          {sections.map((section) => (
            <section
              key={section.title + section.lines[0]?.index}
              className={
                section.lines.some((line) => line.index === activeIndex) ? 'is-active-section' : ''
              }
            >
              <h3>[{section.title}]</h3>
              {section.lines.map((line) => {
                const state =
                  line.index === activeIndex ? 'is-active' : line.index < activeIndex ? 'is-past' : ''
                return (
                  <p
                    key={`${line.index}-${line.text}`}
                    ref={(node) => {
                      if (node) lineRefs.current.set(line.index, node)
                      else lineRefs.current.delete(line.index)
                    }}
                    className={state}
                  >
                    {line.text}
                  </p>
                )
              })}
            </section>
          ))}
        </div>
      )}

      {lyricsOpen && !track.lyrics.length && (
        <div className="lounge-music-lyrics lounge-music-lyrics-empty">
          <p>No synced lyrics for this track yet.</p>
        </div>
      )}
    </div>
  )
}
