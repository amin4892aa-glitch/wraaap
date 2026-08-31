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

export function LoungeMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const track = useMemo(() => getLoungeTrack(LOUNGE_TRACKS[0].id), [])
  const [playing, setPlaying] = useState(false)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)

  const liveIndex = useMemo(
    () => activeLyricIndex(track.lyrics, currentTime),
    [track.lyrics, currentTime],
  )
  const activeIndex =
    playing && liveIndex >= 0 ? liveIndex : pickedIndex

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
    if (!lyricsOpen || activeIndex === null || !listRef.current) return
    const node = listRef.current.querySelector(`[data-lyric-index="${activeIndex}"]`)
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

      <div className="lounge-music-head">
        <button
          type="button"
          className="lounge-music-disc"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          <span className="lounge-music-vinyl" aria-hidden />
        </button>
        <button
          type="button"
          className="lounge-music-title"
          onClick={toggleLyrics}
          aria-expanded={lyricsOpen}
        >
          {track.title}
        </button>
      </div>

      {lyricsOpen && (
        <div ref={listRef} className="lounge-music-list">
          {track.lyrics.map((line, index) => (
            <button
              key={`${index}-${line.text}`}
              type="button"
              data-lyric-index={index}
              className={`lounge-music-line-btn ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => pickLine(index)}
            >
              {line.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
