import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'
import PlayerBar from '../../components/PlayerBar'
import ProfileMenu from '../../components/ProfileMenu'

const coverGradients = ['playlist-cover-a', 'playlist-cover-b', 'playlist-cover-c', 'playlist-cover-d', 'playlist-cover-e']

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library', active: true },
  { icon: 'queue_music', label: 'Playlists', href: '/playlists' },
]

const Library = () => {
  const { user, token } = useAuth()
  const { currentSong, isPlaying, playSong } = usePlayer()

  const [playlists, setPlaylists] = useState([])
  const [likedSongs, setLikedSongs] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [addMenuFor, setAddMenuFor] = useState(null)

  const loadLibrary = () => {
    if (!token) return
    apiFetch('/library', { token })
      .then(({ playlists: pl, likedSongs: liked, recentlyPlayed: recent }) => {
        setPlaylists(pl)
        setLikedSongs(liked)
        setRecentlyPlayed(recent)
      })
      .catch(() => {})
  }

  useEffect(loadLibrary, [token])

  const likedIds = new Set(likedSongs.map((entry) => entry.song.id))

  const toggleLike = (songId) => {
    if (!token) return
    const isLiked = likedIds.has(songId)
    apiFetch(`/library/liked/${songId}`, { method: isLiked ? 'DELETE' : 'POST', token })
      .then(loadLibrary)
      .catch(() => {})
  }

  const createPlaylist = (event) => {
    event.preventDefault()
    const name = newPlaylistName.trim()
    if (!name || !token) return

    apiFetch('/playlists', { method: 'POST', token, body: JSON.stringify({ name }) })
      .then(() => {
        setNewPlaylistName('')
        loadLibrary()
      })
      .catch(() => {})
  }

  const addSongToPlaylist = (playlistId, songId) => {
    if (!token) return
    apiFetch(`/playlists/${playlistId}/songs`, { method: 'POST', token, body: JSON.stringify({ songId }) })
      .then(() => {
        setAddMenuFor(null)
        loadLibrary()
      })
      .catch(() => {})
  }

  const AddToPlaylistMenu = ({ song }) => (
    <div className="library-add-menu" onMouseLeave={() => setAddMenuFor(null)}>
      <button
        type="button"
        className="icon-button"
        aria-label="Add to playlist"
        onClick={() => setAddMenuFor((current) => (current === song.id ? null : song.id))}
      >
        <span className="material-symbols-outlined">playlist_add</span>
      </button>
      {addMenuFor === song.id && (
        <div className="library-add-dropdown">
          {playlists.length === 0 ? (
            <p>Create a playlist first.</p>
          ) : (
            playlists.map((playlist) => (
              <button key={playlist.id} type="button" onClick={() => addSongToPlaylist(playlist.id, song.id)}>
                {playlist.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )

  const playPlaylist = (playlistId) => {
    if (!token) return
    apiFetch(`/playlists/${playlistId}`, { token })
      .then(({ playlist }) => {
        const songs = playlist.songs.map((entry) => entry.song)
        if (songs.length > 0) playSong(songs[0], songs)
      })
      .catch(() => {})
  }

  return (
    <div className="library-page-shell">
      <aside className="sidebar library-sidebar">
        <div className="brand-block library-brand-block">
          <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full rounded-full'/>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`nav-link ${item.active ? 'active' : ''}`}
            >
              <span className={`material-symbols-outlined ${item.active ? 'library-nav-icon-active' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="topbar library-topbar">
        <div className="topbar-left">
          <span className="mobile-brand">BassDrop</span>
        </div>

        <div className="topbar-actions">
          <ProfileMenu />
        </div>
      </header>

      <main className="content library-content">
        <section className="hero-copy">
          <h2>{user?.name ?? 'Your Library'}</h2>
          <p>
            {playlists.length} playlists · {likedSongs.length} liked songs
          </p>
        </section>

        <section className="library-grid">
          <div className="library-main-column">
            <section className="library-section">
              <h2 className="library-section-title">Recently Played</h2>
              <div className="library-track-list">
                {recentlyPlayed.map(({ song }) => {
                  const active = currentSong?.id === song.id
                  return (
                    <article key={song.id} className={`library-track-row ${active ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="library-track-index"
                        aria-label={`Play ${song.title}`}
                        onClick={() => playSong(song, recentlyPlayed.map((entry) => entry.song))}
                      >
                        <span className="material-symbols-outlined filled">
                          {active && isPlaying ? 'graphic_eq' : 'play_arrow'}
                        </span>
                      </button>

                      <div className="track-art">
                        <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                      </div>

                      <div className="library-track-copy">
                        <h3>{song.title}</h3>
                        <p>{song.artist.name}</p>
                      </div>

                      <div className="library-track-meta">
                        <AddToPlaylistMenu song={song} />
                        <button
                          type="button"
                          className={`icon-button library-like-button ${likedIds.has(song.id) ? 'favorite-active' : ''}`}
                          aria-label="Favorite"
                          onClick={() => toggleLike(song.id)}
                        >
                          <span className={`material-symbols-outlined ${likedIds.has(song.id) ? 'filled' : ''}`}>
                            favorite
                          </span>
                        </button>
                        <span>{formatDuration(song.duration)}</span>
                      </div>
                    </article>
                  )
                })}
                {recentlyPlayed.length === 0 && <p>Nothing played yet.</p>}
              </div>
            </section>

            <section className="library-section">
              <div className="section-header library-section-header">
                <h2 className="library-section-title">Liked Songs</h2>
              </div>

              <div className="library-track-list">
                {likedSongs.map(({ song }) => (
                  <article key={song.id} className="library-track-row">
                    <button
                      type="button"
                      className="library-track-index"
                      aria-label={`Play ${song.title}`}
                      onClick={() => playSong(song, likedSongs.map((entry) => entry.song))}
                    >
                      <span className="material-symbols-outlined filled">play_arrow</span>
                    </button>

                    <div className="track-art">
                      <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                    </div>

                    <div className="library-track-copy">
                      <h3>{song.title}</h3>
                      <p>{song.artist.name}</p>
                    </div>

                    <div className="library-track-meta">
                      <AddToPlaylistMenu song={song} />
                      <button
                        type="button"
                        className="icon-button library-like-button favorite-active"
                        aria-label="Unlike"
                        onClick={() => toggleLike(song.id)}
                      >
                        <span className="material-symbols-outlined filled">favorite</span>
                      </button>
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                  </article>
                ))}
                {likedSongs.length === 0 && <p>No liked songs yet.</p>}
              </div>
            </section>
          </div>

          <aside className="library-side-column">
            <section className="library-panel">
              <h2 className="library-panel-title">Your Playlists</h2>

              <form className="playlists-create-row" onSubmit={createPlaylist}>
                <label className="search-shell playlists-create-field" aria-label="New playlist name">
                  <span className="material-symbols-outlined">add</span>
                  <input
                    type="text"
                    placeholder="New playlist name"
                    value={newPlaylistName}
                    onChange={(event) => setNewPlaylistName(event.target.value)}
                  />
                </label>
                <button type="submit" className="primary-pill" disabled={!newPlaylistName.trim()}>
                  Create
                </button>
              </form>

              <div className="playlists-cover-grid">
                {playlists.map((playlist, index) => (
                  <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="playlist-cover-card">
                    <div className={`playlist-cover-art ${coverGradients[index % coverGradients.length]}`}>
                      <span className="material-symbols-outlined filled">queue_music</span>
                      <button
                        type="button"
                        className="play-fab"
                        aria-label={`Play ${playlist.name}`}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          playPlaylist(playlist.id)
                        }}
                      >
                        <span className="material-symbols-outlined filled">play_arrow</span>
                      </button>
                    </div>
                    <h4>{playlist.name}</h4>
                    <p>
                      {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                      {playlist.isPublic ? ' · Public' : ''}
                    </p>
                  </Link>
                ))}
                {playlists.length === 0 && <p className="playlists-empty">Create your first playlist above.</p>}
              </div>
            </section>
          </aside>
        </section>
      </main>

      <PlayerBar likedIds={likedIds} onToggleLike={toggleLike} variant="library" />

      <nav className="mobile-nav library-mobile-nav">
        {navItems.map((item) => (
          <Link key={item.label} to={item.href} className={item.active ? 'active' : ''}>
            <span className={`material-symbols-outlined ${item.active ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label.replace('Your ', '')}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Library
