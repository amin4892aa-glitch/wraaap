import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LOUNGE_TRACKS,
  activeLyricIndex,
  getLoungeTrack,
} from '../data/loungeTracks'
import './LoungeMusicPlayer.css'

function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function lineKeyword(text: string) {
  const cleaned = text.replace(/[()[\]'"]/g, '').trim()
  const word = cleaned.split(/\s+/)[0] || text
  return word.length > 14 ? `${word.slice(0, 12)}…` : word
}

export function LoungeMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const track = useMemo(() => getLoungeTrack(LOUNGE_TRACKS[0].id), [])
  const [playing, setPlaying] = useState(false)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)

  const liveIndex = useMemo(
    () => activeLyricIndex(track.lyrics, currentTime),
    [track.lyrics, currentTime],
  )
  const shownIndex = pickedIndex ?? (playing && liveIndex >= 0 ? liveIndex : null)
  const shownLine = shownIndex !== null ? track.lyrics[shownIndex] : null

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = 0.72
    el.src = assetUrl(track.src)
    el.load()
  }, [track.src])

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

  function toggle() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }
    void el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  function toggleLyrics() {
    setLyricsOpen((open) => !open)
  }

  function pickLine(index: number) {
    setPickedIndex(index)
    setLyricsOpen(true)
    const el = audioRef.current
    const line = track.lyrics[index]
    if (!el || !line) return
    el.currentTime = line.start
    setCurrentTime(line.start)
    if (!playing) {
      void el.play()
        .then(() => setPlaying(true))
        .catch(() => {
          /* ignore */
        })
    }
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
    <div
      className={`lounge-music ${playing ? 'is-playing' : ''} ${lyricsOpen ? 'is-open' : ''}`}
    >
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

      <div className="lounge-music-preview">
        <button
          type="button"
          className="lounge-music-preview-sleeve"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <img src={assetUrl('favicon.svg')} alt="" />
        </button>
        <button type="button" className="lounge-music-preview-disc" onClick={toggle}>
          <span className="lounge-music-preview-vinyl" aria-hidden />
        </button>
        <div className="lounge-music-preview-meta">
          <strong>{track.title}</strong>
          <span>{playing ? `ON AIR · ${formatTime(currentTime)}` : track.subtitle}</span>
        </div>
        <button
          type="button"
          className={`lounge-music-lyrics-btn ${lyricsOpen ? 'is-open' : ''}`}
          onClick={toggleLyrics}
          aria-expanded={lyricsOpen}
        >
          Lyrics {lyricsOpen ? '▲' : '▼'}
        </button>
      </div>

      <div className="lounge-music-drawer">
        <div className="lounge-music-drawer-inner">
          {lyricsOpen && (
            <div className="lounge-music-words">
              {track.lyrics.map((line, index) => (
                <button
                  key={`${index}-${line.text}`}
                  type="button"
                  className={`lounge-music-word ${shownIndex === index ? 'is-picked' : ''}`}
                  onClick={() => pickLine(index)}
                >
                  {lineKeyword(line.text)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {shownLine && (
        <p className="lounge-music-line">{shownLine.text}</p>
      )}
    </div>
  )
}
