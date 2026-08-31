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
  const lineRefs = useRef<Map<number, HTMLParagraphElement>>(new Map())
  const track = useMemo(() => getLoungeTrack(LOUNGE_TRACKS[0].id), [])
  const [playing, setPlaying] = useState(false)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const activeIndex = useMemo(
    () => activeLyricIndex(track.lyrics, currentTime),
    [track.lyrics, currentTime],
  )
  const sections = useMemo(() => lyricSections(track.lyrics), [track.lyrics])

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
    void el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }

  function toggleLyrics() {
    setLyricsOpen((open) => !open)
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
          {lyricsOpen && track.lyrics.length > 0 && (
            <div className="lounge-music-lyrics">
              {sections.map((section) => (
                <section
                  key={section.title + section.lines[0]?.index}
                  className={
                    section.lines.some((line) => line.index === activeIndex)
                      ? 'is-active-section'
                      : ''
                  }
                >
                  <h3>[{section.title}]</h3>
                  {section.lines.map((line) => {
                    const state =
                      line.index === activeIndex
                        ? 'is-active'
                        : line.index < activeIndex
                          ? 'is-past'
                          : ''
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
        </div>
      </div>
    </div>
  )
}
