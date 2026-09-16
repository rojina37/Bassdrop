import React, { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { apiFetch } from '../lib/api'
import { formatDuration, mediaUrl } from '../lib/format'

const NowPlayingExpanded = ({
  song,
  queue,
  currentIndex,
  isPlaying,
  progress,
  duration,
  shuffle,
  repeatMode,
  liked,
  volume,
  onClose,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleLike,
  onSelectSong,
  onSetVolume,
}) => {
  const { playSong } = usePlayer()
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    if (!song?.id) {
      setRecommended([])
      return undefined
    }
    let cancelled = false
    apiFetch(`/recommendations/song/${song.id}?take=5`)
      .then(({ songs }) => {
        if (!cancelled) setRecommended(songs)
      })
      .catch(() => {
        if (!cancelled) setRecommended([])
      })
    return () => {
      cancelled = true
    }
  }, [song?.id])

  // Without this, the page underneath (Home/Library/Search, with its own big
  // cover-art cards) stays scrollable and bleeds through the translucent
  // blurred backdrop whenever a scroll gesture falls through to it.
  useEffect(() => {
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  const handleSeek = (event) => {
    if (!duration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    onSeek(ratio * duration)
  }

  const handleVolumeSeek = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    onSetVolume?.(ratio)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#0e0e0e]/98 backdrop-blur-xl">
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/80 hover:bg-white/10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-sm font-semibold uppercase tracking-wide text-white/60">Now Playing</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close now playing"
          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/80 hover:bg-white/10"
        >
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pb-10 lg:flex-row lg:items-stretch lg:gap-12 lg:overflow-hidden lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-3 lg:h-full lg:overflow-y-auto lg:py-3">
          <div className="h-[55vh] w-full shrink-0 overflow-hidden rounded-2xl bg-white/5 shadow-2xl">
            <img
              src={song?.coverUrl ? mediaUrl(song.coverUrl) : undefined}
              alt={song?.title ?? 'Now playing'}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex w-full shrink-0 items-center justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-white lg:text-3xl">{song?.title ?? 'Nothing playing'}</h2>
              <p className="truncate text-base text-white/60">{song?.artist?.name ?? ''}</p>
            </div>
            <button
              type="button"
              aria-label="Favorite"
              onClick={onToggleLike}
              className={`ml-3 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full ${liked ? 'text-[var(--primary)]' : 'text-white/70'} hover:bg-white/10`}
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
            </button>
          </div>

          <div className="w-full shrink-0">
            <div
              className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/15"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-white/50">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center gap-4">
            <div className="flex flex-1 items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Shuffle"
                onClick={onToggleShuffle}
                className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full ${shuffle ? 'text-[var(--primary)]' : 'text-white/70'} hover:bg-white/10`}
              >
                <span className="material-symbols-outlined">shuffle</span>
              </button>
              <button
                type="button"
                aria-label="Previous"
                onClick={onPrevious}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-3xl">skip_previous</span>
              </button>
              <button
                type="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={onTogglePlay}
                className="grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-white text-black"
              >
                <span className="material-symbols-outlined text-4xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={onNext}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-3xl">skip_next</span>
              </button>
              <button
                type="button"
                aria-label="Repeat"
                onClick={onCycleRepeat}
                className={`grid h-10 w-10 cursor-pointer place-items-center rounded-full ${repeatMode !== 'off' ? 'text-[var(--primary)]' : 'text-white/70'} hover:bg-white/10`}
              >
                <span className="material-symbols-outlined">{repeatMode === 'one' ? 'repeat_one' : 'repeat'}</span>
              </button>
            </div>

            <div className="flex w-32 shrink-0 items-center gap-2 lg:w-40">
              <button
                type="button"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                onClick={() => onSetVolume?.(volume === 0 ? 1 : 0)}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/70 hover:bg-white/10"
              >
                <span className="material-symbols-outlined">
                  {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              <div
                className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/15"
                role="slider"
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={volume}
                tabIndex={0}
                onClick={handleVolumeSeek}
              >
                <div className="h-full rounded-full bg-white/70" style={{ width: `${(volume ?? 0) * 100}%` }} />
              </div>
            </div>
          </div>

          {recommended.length > 0 && (
            <div className="w-full shrink-0">
              <h3 className="mb-1.5 text-sm font-bold text-white/80">Recommended for you</h3>
              <div className="flex w-full gap-3 overflow-x-auto pb-1">
                {recommended.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => playSong(item, recommended)}
                    className="flex w-36 shrink-0 cursor-pointer flex-col gap-2 rounded-xl p-1.5 text-left hover:bg-white/10"
                  >
                    <div className="grid aspect-square w-full shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10 text-white/50">
                      {item.coverUrl ? (
                        <img src={mediaUrl(item.coverUrl)} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">music_note</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                      <p className="truncate text-xs text-white/50">{item.artist?.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {queue.length > 0 && (
          <div className="w-full shrink-0 lg:h-full lg:w-80 lg:overflow-y-auto lg:py-6">
            <h3 className="mb-2 text-sm font-bold text-white/80">Up Next</h3>
            <div className="flex flex-col gap-1">
              {queue.map((item, index) => {
                const active = index === currentIndex
                return (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    onClick={() => onSelectSong(item)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/10 ${
                      active ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.coverUrl ? mediaUrl(item.coverUrl) : undefined}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-semibold ${active ? 'text-[var(--primary)]' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-white/50">{item.artist?.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NowPlayingExpanded
