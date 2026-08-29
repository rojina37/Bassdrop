import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: 'home', label: 'Home', href: '/', active: true },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
]


const madeForYou = [
  {
    title: 'Late Night Grooves',
    description: 'Deep bass and smooth vocals for the after-hours.',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Lo-Fi Focus',
    description: 'The perfect background for deep work.',
    image:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Peak Performance',
    description: 'High-BPM tracks to keep the momentum going.',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Morning Ritual',
    description: 'Gentle melodies to start your day right.',
    image:
      'https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?auto=format&fit=crop&w=900&q=80',
  },
]

const recentlyPlayed = [
  {
    title: 'Neon Circuit',
    meta: 'Digital Ghost • 2024',
    trailing: '3:42',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Synthetic Dreams',
    meta: 'Vapor Engine',
    trailing: 'Active',
    active: true,
    image:
      'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Void Walker',
    meta: 'Midnight Pulse',
    trailing: '5:18',
    image:
      'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=500&q=80',
  },
]

const topCurators = [
  {
    name: 'Elena Cross',
    genre: 'Electronic, Experimental',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Marcus Thorne',
    genre: 'House, Minimal',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Aria Nova',
    genre: 'Ambient, Soundtrack',
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'One Direction',
    genre: 'Pop, Rock',
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
  }
]

const initialChatMessages = [
  {
    id: 1,
    sender: 'Maya',
    message: 'That bassline on Techno Revolution is unreal.',
    time: '2m',
  },
  {
    id: 2,
    sender: 'You',
    message: 'Adding it to the late-night queue now.',
    time: '1m',
    mine: true,
  },
  {
    id: 3,
    sender: 'Juno',
    message: 'Drop the playlist when it is ready.',
    time: 'Now',
  },
]

const Home = () => {
  const [chatMessages, setChatMessages] = useState(initialChatMessages)
  const [chatDraft, setChatDraft] = useState('')

  const sendChatMessage = (event) => {
    event.preventDefault()
    const message = chatDraft.trim()

    if (!message) {
      return
    }

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        sender: 'You',
        message,
        time: 'Now',
        mine: true,
      },
    ])
    setChatDraft('')
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
          <div className="search-shell">
            <span className="material-symbols-outlined">search</span>
            <span>Search artists, tracks, or curators...</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <img
            className="profile-avatar"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
            alt="User profile"
          />
        </div>
      </header>

      <main className="content">
        <section className="hero-copy">
          <h2>Lets Groove!</h2>
        </section>

        <section className="hero-grid">
          <article className="feature-banner">
            <img
              src="https://images.unsplash.com/photo-1571266028243-d220c9fdbd90?auto=format&fit=crop&w=1400&q=80"
              alt="Techno Revolution"
            />
            <div className="feature-overlay" />
            <div className="feature-content">
              <span className="eyebrow">Trending Now</span>
              <h3>Techno Revolution</h3>
              <p>
                Explore the industrial echoes of Berlin&apos;s underground scene. Curated
                for the relentless.
              </p>
              <button type="button" className="primary-pill">
                <span className="material-symbols-outlined filled">play_arrow</span>
                Listen Now
              </button>
            </div>
          </article>
        </section>

        <section className="playlist-section">
          <div className="section-header">
            <h3>Made For You</h3>
            <a href="#">View All</a>
          </div>

          <div className="playlist-grid">
            {madeForYou.map((item) => (
              <article key={item.title} className="playlist-card">
                <div className="playlist-art">
                  <img src={item.image} alt={item.title} />
                  <div className="play-fab">
                    <span className="material-symbols-outlined filled">play_arrow</span>
                  </div>
                </div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lower-grid">
          <div className="recently-played">
            <h3>Recently Played</h3>
            <div className="track-list">
              {recentlyPlayed.map((track) => (
                <article
                  key={track.title}
                  className={`track-row ${track.active ? 'active' : ''}`}
                >
                  <div className="track-main">
                    <div className="track-art">
                      <img src={track.image} alt={track.title} />
                      <div className="track-art-overlay">
                        <span className="material-symbols-outlined">
                          {track.active ? 'graphic_eq' : 'play_arrow'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4>{track.title}</h4>
                      <p>{track.meta}</p>
                    </div>
                  </div>

                  <div className="track-actions">
                    <span className="track-status">{track.trailing}</span>
                    <button type="button" className="icon-button" aria-label="Favorite">
                      <span className="material-symbols-outlined">
                        {track.active ? 'favorite' : 'favorite'}
                      </span>
                    </button>
                    <button type="button" className="icon-button" aria-label="More options">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="curators-card">
            <h3>Top Curators</h3>
            <div className="curator-list">
              {topCurators.map((curator) => (
                <article key={curator.name} className="curator-row">
                  <img src={curator.image} alt={curator.name} />
                  <div>
                    <h4>{curator.name}</h4>
                    <p>{curator.genre}</p>
                  </div>
                  <button type="button">Follow</button>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <footer className="player-bar">
        <div className="player-now-playing">
          <div className="now-art">
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80"
              alt="Currently playing"
            />
            <div className="track-art-overlay">
              <span className="material-symbols-outlined">expand_less</span>
            </div>
          </div>
          <div className="now-meta">
            <h4>Synthetic Dreams</h4>
            <p>Vapor Engine</p>
          </div>
          <button type="button" className="icon-button favorite-active" aria-label="Liked">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>

        <div className="player-controls">
          <div className="control-row">
            {['shuffle', 'skip_previous', 'play_circle', 'skip_next', 'repeat'].map((icon) => (
              <button
                key={icon}
                type="button"
                className={icon === 'play_circle' ? 'play-main' : 'icon-button light'}
                aria-label={icon}
              >
                <span className="material-symbols-outlined filled">{icon}</span>
              </button>
            ))}
          </div>
          <div className="progress-row">
            <span>1:24</span>
            <div className="progress-bar">
              <div className="progress-current" />
            </div>
            <span>3:56</span>
          </div>
        </div>

        <div className="player-extra">
          <button type="button" className="icon-button light" aria-label="Lyrics">
            <span className="material-symbols-outlined">lyrics</span>
          </button>
          <button type="button" className="icon-button light" aria-label="Queue">
            <span className="material-symbols-outlined">queue_music</span>
          </button>
          <div className="volume-shell">
            <span className="material-symbols-outlined">volume_up</span>
            <div className="volume-bar">
              <div className="volume-current" />
            </div>
          </div>
          <button type="button" className="icon-button light" aria-label="Fullscreen">
            <span className="material-symbols-outlined">open_in_full</span>
          </button>
        </div>
      </footer>

      <nav className="mobile-nav">
        {navItems.slice(0, 4).map((item) => (
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
