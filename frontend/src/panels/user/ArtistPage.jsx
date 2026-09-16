import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'

const ArtistPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { playSong } = usePlayer()

  const [artist, setArtist] = useState(null)
  const [songs, setSongs] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setArtist(null)
    setError('')
    apiFetch(`/artists/${id}`)
      .then(({ artist: a }) => setArtist(a))
      .catch((err) => setError(err.message || 'Artist not found'))
    apiFetch(`/songs?artistId=${id}`)
      .then(({ songs: list }) => setSongs(list))
      .catch(() => {})
  }, [id])

  const toggleFollow = () => {
    if (!token) return
    const method = isFollowing ? 'DELETE' : 'POST'
    setIsFollowing(!isFollowing)
    apiFetch(`/artists/${id}/follow`, { method, token }).catch(() => {})
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

  if (!artist) {
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
            src={artist.imageUrl ? mediaUrl(artist.imageUrl) : undefined}
            alt={artist.name}
            className="h-40 w-40 flex-shrink-0 rounded-full bg-white/5 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold">{artist.name}</h1>
            <p className="mt-1 text-sm text-white/50">
              {artist.songCount} songs · {artist.followerCount} followers
            </p>
            {artist.bio && <p className="mt-3 max-w-md text-white/80">{artist.bio}</p>}

            <button
              type="button"
              onClick={toggleFollow}
              className={`mt-5 rounded-full px-5 py-2 font-semibold ${
                isFollowing ? 'border border-white/20 text-white' : 'bg-white text-black'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Songs</h2>
          <div className="grid gap-2">
            {songs.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => playSong(song, songs)}
                className="flex items-center gap-3 rounded-lg border border-white/10 p-3 text-left hover:bg-white/5"
              >
                <img
                  src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined}
                  alt={song.title}
                  className="h-12 w-12 rounded object-cover bg-white/5"
                />
                <div className="flex-1">
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-white/50">{song.album}</p>
                </div>
                <span className="text-sm text-white/50">{formatDuration(song.duration)}</span>
              </button>
            ))}
            {songs.length === 0 && <p className="text-white/60">No songs yet.</p>}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ArtistPage
