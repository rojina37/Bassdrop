import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import PlayerBar from '../../components/PlayerBar'
import ProfileMenu from '../../components/ProfileMenu'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  { icon: 'queue_music', label: 'Playlists', href: '/playlists', active: true },
]

const coverGradients = ['playlist-cover-a', 'playlist-cover-b', 'playlist-cover-c', 'playlist-cover-d', 'playlist-cover-e']

const Playlists = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [playlists, setPlaylists] = useState([])
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)
  const [likedIds, setLikedIds] = useState(() => new Set())

  const loadPlaylists = () => {
    if (!token) return
    apiFetch('/playlists', { token })
      .then(({ playlists: list }) => setPlaylists(list))
      .catch(() => {})
  }

  useEffect(loadPlaylists, [token])

  useEffect(() => {
    if (!token) return
    apiFetch('/library/liked', { token })
      .then(({ likedSongs }) => setLikedIds(new Set(likedSongs.map((entry) => entry.song.id))))
      .catch(() => {})
  }, [token])

  const toggleLike = (songId) => {
    if (!token) return
    const isLiked = likedIds.has(songId)
    const method = isLiked ? 'DELETE' : 'POST'

    setLikedIds((current) => {
      const updated = new Set(current)
      if (isLiked) updated.delete(songId)
      else updated.add(songId)
      return updated
    })

    apiFetch(`/library/liked/${songId}`, { method, token }).catch(() => {})
  }

  const createPlaylist = (event) => {
    event.preventDefault()
    const name = newPlaylistName.trim()
    if (!name || !token) return

    setCreating(true)
    apiFetch('/playlists', { method: 'POST', token, body: JSON.stringify({ name }) })
      .then(({ playlist }) => {
        setNewPlaylistName('')
        loadPlaylists()
        navigate(`/playlist/${playlist.id}`)
      })
      .catch(() => {})
      .finally(() => setCreating(false))
  }

  return (
    <div className="sonic-app">
      <aside className="sidebar">
        <div className="brand-block">
          <img src="/public/images/BD.png" alt="BassDrop logo" className="h-30 w-30 object-full" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className={`nav-link ${item.active ? 'active' : ''}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <span className="mobile-brand">BassDrop</span>
        </div>

        <div className="topbar-actions">
          <ProfileMenu />
        </div>
      </header>

      <main className="content">
        <section className="hero-copy">
          <h2>Your Playlists</h2>
        </section>

        <form className="playlists-create-row" onSubmit={createPlaylist}>
          <label className="search-shell playlists-create-field" aria-label="New playlist name">
            <span className="material-symbols-outlined">add</span>
            <input
              type="text"
              placeholder="Give your playlist a name…"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
            />
          </label>
          <button type="submit" className="primary-pill" disabled={creating || !newPlaylistName.trim()}>
            Create
          </button>
        </form>

        <section className="playlists-grid-section">
          <div className="playlists-cover-grid">
            {playlists.map((playlist, index) => (
              <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="playlist-cover-card">
                <div className={`playlist-cover-art ${coverGradients[index % coverGradients.length]}`}>
                  <span className="material-symbols-outlined filled">queue_music</span>
                  <span className="play-fab" aria-hidden="true">
                    <span className="material-symbols-outlined filled">play_arrow</span>
                  </span>
                </div>
                <h4>{playlist.name}</h4>
                <p>
                  {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'} · {user?.name}
                </p>
              </Link>
            ))}
          </div>

          {playlists.length === 0 && <p className="playlists-empty">Create your first playlist above.</p>}
        </section>
      </main>

      <PlayerBar likedIds={likedIds} onToggleLike={toggleLike} variant="playlists" />

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link key={item.label} to={item.href} className={item.active ? 'active' : ''}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label.replace('Your ', '')}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Playlists
