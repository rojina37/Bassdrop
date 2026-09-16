import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { useToast } from '../../context/ToastContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'

const SongPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer()
  const { showToast } = useToast()

  const [song, setSong] = useState(null)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    setSong(null)
    setError('')
    apiFetch(`/songs/${id}`)
      .then(({ song: s }) => setSong(s))
      .catch((err) => setError(err.message || 'Song not found'))
  }, [id])

  useEffect(() => {
    if (!token) return
    apiFetch('/library/liked', { token })
      .then(({ likedSongs }) => setLiked(likedSongs.some((entry) => entry.song.id === id)))
      .catch(() => {})
    apiFetch('/playlists', { token })
      .then(({ playlists: pl }) => setPlaylists(pl))
      .catch(() => {})
  }, [token, id])

  const isCurrent = currentSong?.id === id

  const handlePlay = () => {
    if (!song) return
    if (isCurrent) togglePlay()
    else playSong(song, [song])
  }

  const toggleLike = () => {
    if (!token) return
    const method = liked ? 'DELETE' : 'POST'
    setLiked(!liked)
    apiFetch(`/library/liked/${id}`, { method, token }).catch(() => {})
  }

  const addToPlaylist = async () => {
    if (!token || !selectedPlaylistId) return
    setStatus('')
    try {
      await apiFetch(`/playlists/${selectedPlaylistId}/songs`, {
        method: 'POST',
        token,
        body: JSON.stringify({ songId: id }),
      })
      showToast('Added to playlist.')
    } catch (err) {
      setStatus(err.message || 'Could not add to playlist.')
    }
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard.')
    } catch {
      setStatus(window.location.href)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">
        <p>{error}</p>
        <Link to="/" className="underline">
          Back home
        </Link>
      </div>
    )
  }

  if (!song) {
    return <div className="min-h-screen bg-[var(--bg)] p-8 text-[var(--text)]">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="p-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-white/60 hover:text-white"
        >
          &larr; Back
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <img
            src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined}
            alt={song.title}
            className="h-48 w-48 flex-shrink-0 rounded-2xl bg-white/5 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{song.title}</h1>
            <Link to={`/artist/${song.artist.id}`} className="text-lg text-white/70 hover:underline">
              {song.artist.name}
            </Link>
            <p className="mt-1 text-sm text-white/50">
              {song.album ? `${song.album} · ` : ''}
              {song.genre.name} · {formatDuration(song.duration)}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePlay}
                className="rounded-full bg-white px-5 py-2 font-semibold text-black"
              >
                {isCurrent && isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={toggleLike}
                className={`rounded-full border px-5 py-2 ${
                  liked ? 'border-red-400 text-red-400' : 'border-white/20'
                }`}
              >
                {liked ? 'Liked' : 'Like'}
              </button>
              <button type="button" onClick={share} className="rounded-full border border-white/20 px-5 py-2">
                Share
              </button>
            </div>

            {token && (
              <div className="mt-4 flex items-center gap-2">
                <select
                  value={selectedPlaylistId}
                  onChange={(event) => setSelectedPlaylistId(event.target.value)}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2"
                >
                  <option value="">Add to playlist…</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addToPlaylist}
                  disabled={!selectedPlaylistId}
                  className="rounded-full border border-white/20 px-4 py-2 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            )}

            {status && <p className="mt-3 text-sm text-white/70">{status}</p>}
          </div>
        </div>

        {song.lyrics && (
          <section className="mt-10">
            <h2 className="mb-3 text-xl font-semibold">Lyrics</h2>
            <p className="whitespace-pre-wrap text-white/80">{song.lyrics}</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default SongPage
