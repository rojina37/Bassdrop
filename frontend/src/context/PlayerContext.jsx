import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'
import { mediaUrl } from '../lib/format'
import { useAuth } from './AuthContext'

const PlayerContext = createContext(null)

// So a page refresh mid-song resumes with the same track loaded (paused —
// browsers block unprompted autoplay anyway) instead of dropping back to
// the "Choose a song" empty state.
const STORAGE_KEY = 'bassdrop.player.state'

function shuffleArray(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function loadPersistedPlayerState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistPlayerState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode, quota) — playback still works, it just won't survive a refresh.
  }
}

export function PlayerProvider({ children }) {
  const { token } = useAuth()
  const tokenRef = useRef(token)
  tokenRef.current = token

  const audioRef = useRef(null)
  if (audioRef.current === null && typeof Audio !== 'undefined') {
    audioRef.current = new Audio()
  }

  const queueRef = useRef([])
  const indexRef = useRef(-1)
  const originalQueueRef = useRef([])

  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeValue] = useState(1)
  const [shuffle, setShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState('off') // 'off' | 'all' | 'one'

  const shuffleRef = useRef(shuffle)
  shuffleRef.current = shuffle
  const repeatModeRef = useRef(repeatMode)
  repeatModeRef.current = repeatMode

  useEffect(() => {
    queueRef.current = queue
  }, [queue])
  useEffect(() => {
    indexRef.current = currentIndex
  }, [currentIndex])

  // Restore the last-playing song (paused) on mount, once, from localStorage.
  useEffect(() => {
    const saved = loadPersistedPlayerState()
    if (!saved || !Array.isArray(saved.queue) || saved.queue.length === 0) return
    const idx = Number.isInteger(saved.currentIndex) ? saved.currentIndex : -1
    if (idx < 0 || idx >= saved.queue.length) return

    queueRef.current = saved.queue
    originalQueueRef.current = Array.isArray(saved.originalQueue) && saved.originalQueue.length
      ? saved.originalQueue
      : saved.queue
    indexRef.current = idx
    shuffleRef.current = Boolean(saved.shuffle)
    repeatModeRef.current = saved.repeatMode === 'all' || saved.repeatMode === 'one' ? saved.repeatMode : 'off'

    setQueue(saved.queue)
    setCurrentIndex(idx)
    setShuffle(shuffleRef.current)
    setRepeatMode(repeatModeRef.current)

    const song = saved.queue[idx]
    const audio = audioRef.current
    if (!song || !audio) return

    const initialVolume = typeof saved.volume === 'number' ? saved.volume : 1
    audio.volume = initialVolume
    setVolumeValue(initialVolume)

    audio.src = mediaUrl(song.audioUrl)
    const resumeAt = typeof saved.progress === 'number' ? saved.progress : 0
    setProgress(resumeAt)
    audio.addEventListener(
      'loadedmetadata',
      () => {
        audio.currentTime = resumeAt
      },
      { once: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentSong = currentIndex >= 0 ? queue[currentIndex] ?? null : null

  const playIndex = useCallback((index) => {
    const song = queueRef.current[index]
    const audio = audioRef.current
    if (!song || !audio) return

    setCurrentIndex(index)
    audio.src = mediaUrl(song.audioUrl)
    audio.play().catch(() => {})

    if (tokenRef.current) {
      apiFetch(`/library/recent/${song.id}`, { method: 'POST', token: tokenRef.current }).catch(() => {})
    }
  }, [])

  const next = useCallback(() => {
    const q = queueRef.current
    if (q.length === 0) return
    playIndex((indexRef.current + 1) % q.length)
  }, [playIndex])

  const previous = useCallback(() => {
    const q = queueRef.current
    if (q.length === 0) return
    playIndex((indexRef.current - 1 + q.length) % q.length)
  }, [playIndex])

  const toggleShuffle = useCallback(() => {
    const next = !shuffleRef.current
    const q = queueRef.current
    const playing = indexRef.current >= 0 ? q[indexRef.current] : null

    if (next) {
      originalQueueRef.current = q
      const rest = playing ? q.filter((_, i) => i !== indexRef.current) : q
      const shuffled = shuffleArray(rest)
      const newQueue = playing ? [playing, ...shuffled] : shuffled
      queueRef.current = newQueue
      setQueue(newQueue)
      if (playing) {
        indexRef.current = 0
        setCurrentIndex(0)
      }
    } else {
      const original = originalQueueRef.current.length ? originalQueueRef.current : q
      queueRef.current = original
      setQueue(original)
      if (playing) {
        const idx = original.findIndex((s) => s.id === playing.id)
        indexRef.current = idx === -1 ? 0 : idx
        setCurrentIndex(idx === -1 ? 0 : idx)
      }
    }

    shuffleRef.current = next
    setShuffle(next)
  }, [])

  const cycleRepeat = useCallback(() => {
    setRepeatMode((current) => (current === 'off' ? 'all' : current === 'all' ? 'one' : 'off'))
  }, [])

  // Persist whenever the "which song / how it's queued" state changes.
  // Progress itself is saved separately (throttled) below since it fires many times a second.
  useEffect(() => {
    if (currentIndex < 0 || queue.length === 0) return
    persistPlayerState({
      queue,
      originalQueue: originalQueueRef.current,
      currentIndex,
      shuffle,
      repeatMode,
      volume,
      progress: audioRef.current?.currentTime ?? 0,
    })
  }, [queue, currentIndex, shuffle, repeatMode, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    let lastPersistedAt = 0
    const onTimeUpdate = () => {
      setProgress(audio.currentTime)
      const now = Date.now()
      if (now - lastPersistedAt < 5000) return
      lastPersistedAt = now
      if (indexRef.current < 0 || queueRef.current.length === 0) return
      persistPlayerState({
        queue: queueRef.current,
        originalQueue: originalQueueRef.current,
        currentIndex: indexRef.current,
        shuffle: shuffleRef.current,
        repeatMode: repeatModeRef.current,
        volume: audio.volume,
        progress: audio.currentTime,
      })
    }
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }
      const q = queueRef.current
      const isLast = indexRef.current === q.length - 1
      if (repeatModeRef.current === 'off' && isLast) return
      next()
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [next])

  const playSong = useCallback((song, songQueue) => {
    const list = songQueue && songQueue.length ? songQueue : [song]
    originalQueueRef.current = list

    if (shuffleRef.current) {
      const rest = list.filter((s) => s.id !== song.id)
      const newQueue = [song, ...shuffleArray(rest)]
      setQueue(newQueue)
      queueRef.current = newQueue
      playIndex(0)
      return
    }

    const index = list.findIndex((s) => s.id === song.id)
    setQueue(list)
    queueRef.current = list
    playIndex(index === -1 ? 0 : index)
  }, [playIndex])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [])

  const seek = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setProgress(seconds)
  }, [])

  const setVolume = useCallback((value) => {
    const audio = audioRef.current
    if (audio) audio.volume = value
    setVolumeValue(value)
  }, [])

  const value = {
    currentSong,
    currentIndex,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeatMode,
    playSong,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider')
  return ctx
}
