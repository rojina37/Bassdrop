import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { formatDuration, mediaUrl } from '../../lib/format'
import PlayerBar from '../../components/PlayerBar'
import ProfileMenu from '../../components/ProfileMenu'

const navItems = [
  { icon: 'home', label: 'Home', href: '/', active: true },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  { icon: 'queue_music', label: 'Playlists', href: '/playlists' },
]

const Home = () => {
  const { token } = useAuth()
  const { currentSong, isPlaying, playSong } = usePlayer()

  const [madeForYou, setMadeForYou] = useState([])
  const [topPicks, setTopPicks] = useState([])
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [followingIds, setFollowingIds] = useState(() => new Set())
  const [likedIds, setLikedIds] = useState(() => new Set())

  useEffect(() => {
    apiFetch('/songs?take=4')
      .then(({ songs }) => setMadeForYou(songs))
      .catch(() => {})

    apiFetch('/artists?take=4')
      .then(({ artists }) => setTopArtists(artists))
      .catch(() => {})

    if (token) {
      apiFetch('/library', { token })
        .then(({ recentlyPlayed: recent, likedSongs }) => {
          setRecentlyPlayed(recent)
          setLikedIds(new Set(likedSongs.map((entry) => entry.song.id)))
        })
        .catch(() => {})

      apiFetch('/recommendations?take=8', { token })
        .then(({ songs }) => setTopPicks(songs))
        .catch(() => {})
    }
  }, [token])

  const playFromList = (song, list) => {
    playSong(song, list)
  }

  const toggleLike = (songId) => {
    if (!token) return
    const isLiked = likedIds.has(songId)
    const method = isLiked ? 'DELETE' : 'POST'

    setLikedIds((current) => {
      const next = new Set(current)
      if (isLiked) next.delete(songId)
      else next.add(songId)
      return next
    })

    apiFetch(`/library/liked/${songId}`, { method, token }).catch(() => {})
  }

  const toggleFollow = (artistId) => {
    if (!token) return
    const isFollowing = followingIds.has(artistId)
    const method = isFollowing ? 'DELETE' : 'POST'

    setFollowingIds((current) => {
      const nextSet = new Set(current)
      if (isFollowing) nextSet.delete(artistId)
      else nextSet.add(artistId)
      return nextSet
    })

    apiFetch(`/artists/${artistId}/follow`, { method, token }).catch(() => {})
  }

  return (
    <div className="sonic-app">
      <aside className="sidebar">
        <div className="brand-block">
          {/* <h1 className='text-[#72fe8f]'>Bass <span className='text-white'>Drop</span></h1> */}
          <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full'/>
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
          <h2>Lets Groove!</h2>
        </section>

        {topPicks.length > 0 && (
          <section className="playlist-section">
            <div className="section-header">
              <h3>Top Picks for You</h3>
            </div>

            <div className="playlist-grid">
              {topPicks.map((song) => (
                <article key={song.id} className="playlist-card">
                  <div className="playlist-art">
                    <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                    <button
                      type="button"
                      className="play-fab"
                      aria-label={`Play ${song.title}`}
                      onClick={() => playFromList(song, topPicks)}
                    >
                      <span className="material-symbols-outlined filled">play_arrow</span>
                    </button>
                  </div>
                  <h4>
                    <Link to={`/song/${song.id}`}>{song.title}</Link>
                  </h4>
                  <p>
                    <Link to={`/artist/${song.artist.id}`}>{song.artist.name}</Link>
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="playlist-section">
          <div className="section-header">
            <h3>New Releases</h3>
            <a href="#">View All</a>
          </div>

          <div className="playlist-grid">
            {madeForYou.map((song) => (
              <article key={song.id} className="playlist-card">
                <div className="playlist-art">
                  <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                  <button
                    type="button"
                    className="play-fab"
                    aria-label={`Play ${song.title}`}
                    onClick={() => playFromList(song, madeForYou)}
                  >
                    <span className="material-symbols-outlined filled">play_arrow</span>
                  </button>
                </div>
                <h4>
                  <Link to={`/song/${song.id}`}>{song.title}</Link>
                </h4>
                <p>
                  <Link to={`/artist/${song.artist.id}`}>{song.artist.name}</Link>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="lower-grid">
          <div className="recently-played">
            <h3>Recently Played</h3>
            <div className="track-list">
              {recentlyPlayed.map(({ song }) => {
                const active = currentSong?.id === song.id
                return (
                  <article key={song.id} className={`track-row ${active ? 'active' : ''}`}>
                    <div
                      className="track-main"
                      role="button"
                      tabIndex={0}
                      onClick={() => playFromList(song, recentlyPlayed.map((entry) => entry.song))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          playFromList(song, recentlyPlayed.map((entry) => entry.song))
                        }
                      }}
                    >
                      <div className="track-art">
                        <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
                        <div className="track-art-overlay">
                          <span className="material-symbols-outlined">
                            {active && isPlaying ? 'graphic_eq' : 'play_arrow'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4>{song.title}</h4>
                        <p>{song.artist.name}</p>
                      </div>
                    </div>

                    <div className="track-actions">
                      <span className="track-status">{formatDuration(song.duration)}</span>
                      <button
                        type="button"
                        className={`icon-button ${likedIds.has(song.id) ? 'favorite-active' : ''}`}
                        aria-label="Favorite"
                        onClick={() => toggleLike(song.id)}
                      >
                        <span className="material-symbols-outlined">favorite</span>
                      </button>
                    </div>
                  </article>
                )
              })}
              {recentlyPlayed.length === 0 && <p>Nothing played yet — start listening to build your history.</p>}
            </div>
          </div>

          <aside className="curators-card">
            <h3>Artists to Follow</h3>
            <div className="curator-list">
              {topArtists.map((artist) => (
                <article key={artist.id} className="curator-row">
                  <img src={artist.imageUrl ? mediaUrl(artist.imageUrl) : undefined} alt={artist.name} />
                  <div>
                    <h4>
                      <Link to={`/artist/${artist.id}`}>{artist.name}</Link>
                    </h4>
                    <p>{artist.songCount} songs</p>
                  </div>
                  <button type="button" onClick={() => toggleFollow(artist.id)}>
                    {followingIds.has(artist.id) ? 'Following' : 'Follow'}
                  </button>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <PlayerBar likedIds={likedIds} onToggleLike={toggleLike} />

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

export default Home
