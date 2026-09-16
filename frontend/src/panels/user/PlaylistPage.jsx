import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'

const PlaylistPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    playSong,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
  } = usePlayer()

  const [playlist, setPlaylist] = useState(null)
  const [error, setError] = useState('')

  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addQuery, setAddQuery] = useState('')
  const [addResults, setAddResults] = useState([])
  const [catalogSongs, setCatalogSongs] = useState([])
  const [addingId, setAddingId] = useState(null)

  const load = () => {
    if (!token) return
    apiFetch(`/playlists/${id}`, { token })
      .then(({ playlist: p }) => setPlaylist(p))
      .catch((err) => setError(err.message || 'Playlist not found'))
  }

  useEffect(() => {
    setPlaylist(null)
    setError('')
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token])

  const songs = playlist?.songs.map((entry) => entry.song) ?? []
  const songIds = new Set(songs.map((song) => song.id))

  const visibleSongs = searchQuery.trim()
    ? songs.filter((song) => {
        const q = searchQuery.trim().toLowerCase()
        return song.title.toLowerCase().includes(q) || song.artist.name.toLowerCase().includes(q)
      })
    : songs

  useEffect(() => {
    if (!showAddModal) return
    apiFetch('/songs?take=50')
      .then(({ songs: list }) => setCatalogSongs(list))
      .catch(() => {})
  }, [showAddModal])

  useEffect(() => {
    const trimmed = addQuery.trim()
    if (!trimmed) {
      setAddResults([])
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      apiFetch(`/search?q=${encodeURIComponent(trimmed)}&type=songs`)
        .then(({ songs: results }) => {
          if (!cancelled) setAddResults(results)
        })
        .catch(() => {})
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [addQuery])

  const addSong = (songId) => {
    if (!token) return
    setAddingId(songId)
    apiFetch(`/playlists/${id}/songs`, { method: 'POST', token, body: JSON.stringify({ songId }) })
      .then(load)
      .catch(() => {})
      .finally(() => setAddingId(null))
  }

  const playAll = () => {
    if (songs.length === 0) return
    playSong(songs[0], songs)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setAddQuery('')
    setAddResults([])
  }

  const addListSongs = addQuery.trim() ? addResults : catalogSongs

  const removeSong = (songId, event) => {
    event.stopPropagation()
    event.preventDefault()
    if (!token) return
    apiFetch(`/playlists/${id}/songs/${songId}`, { method: 'DELETE', token })
      .then(load)
      .catch(() => {})
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
        <p>{error}</p>
        <Link to="/playlists" className="underline">
          Back to playlists
        </Link>
      </div>
    )
  }

  if (!playlist) {
    return <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">Loading…</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] lg:flex-row">
      <div className="flex-1 px-5 pb-16 pt-5 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 rounded-full px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSearch((current) => !current)
                setSearchQuery('')
              }}
              aria-label="Search in playlist"
              className={`grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 ${showSearch ? 'bg-white/10 text-white' : 'text-white/70'}`}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label="Add songs to playlist"
              className="grid h-10 w-10 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-white/50">Playlist</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{playlist.name}</h1>
          <p className="mt-1 text-sm text-white/50">{songs.length} songs</p>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={playAll}
            disabled={songs.length === 0}
            aria-label="Play playlist"
            className="grid h-14 w-14 place-items-center rounded-full bg-[var(--primary)] text-black transition hover:scale-105 disabled:opacity-40"
          >
            <span
              className={`material-symbols-outlined filled text-3xl ${
                isPlaying && currentSong && songIds.has(currentSong.id) ? '' : 'pl-0.5'
              }`}
            >
              {isPlaying && currentSong && songIds.has(currentSong.id) ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        {showSearch && (
          <section className="mt-6">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search in playlist…"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 outline-none placeholder:text-white/40"
            />
          </section>
        )}

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {visibleSongs.map((song) => {
            const active = currentSong?.id === song.id
            return (
              <div
                key={song.id}
                className="group relative rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
              >
                <button
                  type="button"
                  onClick={(event) => removeSong(song.id, event)}
                  aria-label={`Remove ${song.title} from playlist`}
                  className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white/70 opacity-0 transition hover:text-white group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>

                <Link to={`/song/${song.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-white/5">
                    <img
                      src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault()
                        active ? togglePlay() : playSong(song, songs)
                      }}
                      aria-label={active && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                      className={`absolute inset-0 grid place-items-center bg-black/40 transition-opacity ${
                        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--primary)] text-black">
                        <span className={`material-symbols-outlined filled text-2xl ${active && isPlaying ? '' : 'pl-0.5'}`}>
                          {active && isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </span>
                    </button>
                  </div>

                  <p className={`mt-2 truncate text-sm font-semibold ${active ? 'text-[var(--primary)]' : ''}`}>
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-white/50">{song.artist.name}</p>
                </Link>
              </div>
            )
          })}
          {visibleSongs.length === 0 && (
            <p className="col-span-full text-white/60">
              {songs.length === 0
                ? 'No songs in this playlist yet.'
                : `No songs match "${searchQuery.trim()}".`}
            </p>
          )}
        </section>
      </div>

      <aside className="shrink-0 border-white/10 bg-black/20 p-5 lg:w-80 lg:border-l">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white/5">
          {currentSong ? (
            <img
              src={currentSong.coverUrl ? mediaUrl(currentSong.coverUrl) : undefined}
              alt={currentSong.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-white/10 to-white/[0.02] text-white/30">
              <span className="material-symbols-outlined text-6xl">music_note</span>
            </div>
          )}
        </div>

        {currentSong ? (
          <>
            <div className="mt-4 min-w-0">
              <p className="truncate text-lg font-bold">{currentSong.title}</p>
              <p className="truncate text-sm text-white/50">{currentSong.artist?.name ?? ''}</p>
            </div>

            <div className="mt-4">
              <div
                className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/15"
                onClick={(event) => {
                  if (!duration) return
                  const rect = event.currentTarget.getBoundingClientRect()
                  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
                  seek(ratio * duration)
                }}
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

            <div className="mt-3 flex items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Shuffle"
                onClick={toggleShuffle}
                className={`p-2 ${shuffle ? 'text-[var(--primary)]' : 'text-white/70'} hover:text-white`}
              >
                <span className="material-symbols-outlined text-xl">shuffle</span>
              </button>
              <button type="button" aria-label="Previous" onClick={previous} className="p-2 text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-2xl">skip_previous</span>
              </button>
              <button
                type="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={togglePlay}
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-black"
              >
                <span className={`material-symbols-outlined text-3xl ${isPlaying ? '' : 'pl-0.5'}`}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button type="button" aria-label="Next" onClick={next} className="p-2 text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-2xl">skip_next</span>
              </button>
              <div className="w-9" aria-hidden="true" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                className="p-1 text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">
                  {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
              </button>
              <div
                className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/15"
                role="slider"
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={volume}
                tabIndex={0}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
                  setVolume(ratio)
                }}
              >
                <div className="h-full rounded-full bg-white" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 text-center">
            <p className="font-semibold text-white/80">Choose a song to play</p>
            <p className="mt-1 text-sm text-white/40">Pick a track from the playlist below to get started.</p>
          </div>
        )}

        {songs.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">Playlist</h4>
            <div className="flex flex-col gap-1">
              {songs.map((song, index) => {
                const active = currentSong?.id === song.id
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => (active ? togglePlay() : playSong(song, songs))}
                    className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-white/10 ${
                      active ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className={`w-4 shrink-0 text-xs ${active ? 'text-[var(--primary)]' : 'text-white/40'}`}>
                      {active && isPlaying ? (
                        <span className="material-symbols-outlined text-sm">graphic_eq</span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <img
                      src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined}
                      alt={song.title}
                      className="h-9 w-9 shrink-0 rounded object-cover bg-white/5"
                    />
                    <span className="min-w-0">
                      <p className={`truncate text-sm font-medium ${active ? 'text-[var(--primary)]' : ''}`}>
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-white/50">{song.artist.name}</p>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </aside>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 sm:pt-24"
          onClick={closeAddModal}
        >
          <div
            className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-bold">Add songs</h3>
              <button
                type="button"
                onClick={closeAddModal}
                aria-label="Close"
                className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 pb-0">
              <input
                type="text"
                autoFocus
                value={addQuery}
                onChange={(event) => setAddQuery(event.target.value)}
                placeholder="Search songs…"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 outline-none placeholder:text-white/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {addListSongs.map((song) => {
                const alreadyAdded = songIds.has(song.id)
                return (
                  <div key={song.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                    <img
                      src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined}
                      alt={song.title}
                      className="h-10 w-10 rounded bg-white/5 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{song.title}</p>
                      <p className="truncate text-xs text-white/50">{song.artist.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSong(song.id)}
                      disabled={alreadyAdded || addingId === song.id}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold disabled:opacity-40"
                    >
                      {alreadyAdded ? 'Added' : addingId === song.id ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                )
              })}
              {addListSongs.length === 0 && (
                <p className="p-3 text-sm text-white/50">
                  {addQuery.trim() ? `No songs found for "${addQuery}".` : 'No songs available.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistPage
