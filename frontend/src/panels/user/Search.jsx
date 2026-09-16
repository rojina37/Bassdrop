import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'
import PlayerBar from '../../components/PlayerBar'
import ProfileMenu from '../../components/ProfileMenu'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search', active: true },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  { icon: 'queue_music', label: 'Playlists', href: '/playlists' },
]

const genreGradients = ['genre-pop', 'genre-rock', 'genre-focus', 'genre-jazz', 'genre-hip-hop']

const Search = () => {
  const { token } = useAuth()
  const { playSong } = usePlayer()

  const [query, setQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState(null)
  const [songs, setSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])
  const [likedIds, setLikedIds] = useState(() => new Set())

  useEffect(() => {
    apiFetch('/genres')
      .then(({ genres: allGenres }) => setGenres(allGenres))
      .catch(() => {})

    if (token) {
      apiFetch('/library/liked', { token })
        .then(({ likedSongs }) => setLikedIds(new Set(likedSongs.map((entry) => entry.song.id))))
        .catch(() => {})
    }
  }, [token])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSongs([])
      setArtists([])
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      // Genre tiles filter by genreId directly instead of text-searching the
      // genre's name against song titles/albums, which rarely matches anything.
      const request = genreFilter
        ? apiFetch(`/songs?genreId=${encodeURIComponent(genreFilter)}`).then(({ songs }) => ({ songs, artists: [] }))
        : apiFetch(`/search?q=${encodeURIComponent(trimmed)}`)

      request
        .then((result) => {
          if (cancelled) return
          setSongs(result.songs)
          setArtists(result.artists)
        })
        .catch(() => {})
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, genreFilter])

  const toggleLike = (songId) => {
    if (!token) return
    const isLiked = likedIds.has(songId)
    setLikedIds((current) => {
      const nextSet = new Set(current)
      if (isLiked) nextSet.delete(songId)
      else nextSet.add(songId)
      return nextSet
    })
    apiFetch(`/library/liked/${songId}`, { method: isLiked ? 'DELETE' : 'POST', token }).catch(() => {})
  }

  const featuredArtist = artists[0] ?? null

  return (
    <div className="BassDrop-app search-page-shell">
      <nav className="topbar search-topbar">
        <div className="topbar-left">
          <span className="search-topbar-brand">BaseDrop</span>
        </div>

        <div className="topbar-actions">
          <ProfileMenu avatarClassName="profile-avatar search-profile-avatar" frameClassName="search-profile-frame" />
        </div>
      </nav>

      <aside className="sidebar search-sidebar">
        <div className="search-sidebar-brand">
         <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full rounded-full'/>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`nav-link ${item.active ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content search-main">
        <div className="search-canvas">
          <header className="search-header">
            <div className="search-field">
              <span className="material-symbols-outlined search-field-icon">search</span>
              <input
                type="text"
                placeholder="What do you want to listen to?"
                value={query}
                onChange={(event) => {
                  setGenreFilter(null)
                  setQuery(event.target.value)
                }}
              />
            </div>
          </header>

          {query.trim() ? (
            <section className="search-block">
              <div className="search-block-header">
                <button
                  type="button"
                  className="icon-button search-back-button"
                  aria-label="Back to browse"
                  onClick={() => {
                    setQuery('')
                    setGenreFilter(null)
                  }}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="search-block-title">Top Results</h2>
              </div>
              <div className="top-results-grid">
                {featuredArtist && (
                  <Link to={`/artist/${featuredArtist.id}`} className="featured-artist-card inner-glow">
                    <div className="featured-artist-content">
                      <div className="featured-artist-avatar">
                        <img
                          src={featuredArtist.imageUrl ? mediaUrl(featuredArtist.imageUrl) : undefined}
                          alt={featuredArtist.name}
                        />
                      </div>
                      <h3>{featuredArtist.name}</h3>
                      <div className="featured-artist-meta">
                        <span>Artist</span>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="top-results-list">
                  {songs.map((song) => (
                    <article key={song.id} className="top-result-row">
                      <button
                        type="button"
                        className="top-result-play-button"
                        aria-label={`Play ${song.title}`}
                        onClick={() => playSong(song, songs)}
                      >
                        <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                      </button>
                      <div className="top-result-copy">
                        <p className="top-result-title">
                          <Link to={`/song/${song.id}`}>{song.title}</Link>
                        </p>
                        <p className="top-result-meta">{song.artist.name}{song.album ? ` - ${song.album}` : ''}</p>
                      </div>
                      <button
                        type="button"
                        className={`icon-button ${likedIds.has(song.id) ? 'favorite-active' : ''}`}
                        aria-label="Favorite"
                        onClick={() => toggleLike(song.id)}
                      >
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                      <span className="top-result-duration">{formatDuration(song.duration)}</span>
                    </article>
                  ))}
                  {songs.length === 0 && <p>No songs found for &quot;{query}&quot;.</p>}
                </div>
              </div>
            </section>
          ) : (
            <section className="search-block">
              <div className="section-header search-section-header">
                <h3>Browse All</h3>
              </div>

              <div className="browse-grid">
                {genres.map((genre, index) => (
                  <button
                    type="button"
                    key={genre.id}
                    className={`browse-card ${genreGradients[index % genreGradients.length]}`}
                    onClick={() => {
                      setGenreFilter(genre.id)
                      setQuery(genre.name)
                    }}
                  >
                    <div className="browse-card-gradient" />
                    <span>{genre.name}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <PlayerBar likedIds={likedIds} onToggleLike={toggleLike} variant="search" />

      <nav className="mobile-nav search-mobile-nav">
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

export default Search
