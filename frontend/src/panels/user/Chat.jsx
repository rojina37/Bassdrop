import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat', active: true },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
 
]

const rooms = [
  {
    id: 'pop',
    name: 'Pop Pulse',
    genre: 'Pop',
    members: '18.2k',
    online: 842,
    accent: '#f472b6',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80',
    topic: 'Hooks, chart drops, vocal stacks, and new artist finds.',
  },
  {
    id: 'rock',
    name: 'Rock Circuit',
    genre: 'Rock',
    members: '11.7k',
    online: 319,
    accent: '#fb7185',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=700&q=80',
    topic: 'Guitar rooms, live sets, gear talk, and band discovery.',
  },
  {
    id: 'jazz',
    name: 'Jazz Loft',
    genre: 'Jazz',
    members: '9.4k',
    online: 226,
    accent: '#fbbf24',
    image:
      'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=700&q=80',
    topic: 'Improvisation, classic records, modern trios, and session notes.',
  },
  {
    id: 'electronic',
    name: 'Electronic Grid',
    genre: 'Electronic',
    members: '23.1k',
    online: 1204,
    accent: '#72fe8f',
    image:
      'https://images.unsplash.com/photo-1571266028243-d220c9fdbd90?auto=format&fit=crop&w=700&q=80',
    topic: 'Club systems, synth patches, drops, and producer circles.',
  },
  {
    id: 'hiphop',
    name: 'Verse Room',
    genre: 'Hip Hop',
    members: '15.8k',
    online: 691,
    accent: '#a78bfa',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80',
    topic: 'Bars, beats, cyphers, samples, and underground releases.',
  },
  {
    id: 'ambient',
    name: 'Ambient Field',
    genre: 'Ambient',
    members: '7.9k',
    online: 174,
    accent: '#88ebff',
    image:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=700&q=80',
    topic: 'Textures, soundscapes, slow listening, and focus sessions.',
  },
]

const artistGroups = [
  { name: 'Cyber Phonic Circle', genre: 'Electronic', members: '12.4k', live: true },
  { name: 'Neon Vocalists', genre: 'Pop', members: '8.1k', live: true },
  { name: 'Blue Note Lab', genre: 'Jazz', members: '5.7k' },
  { name: 'Static Amp Society', genre: 'Rock', members: '6.6k' },
]

const startingMessages = {
  pop: [
    { id: 1, sender: 'Lena', message: 'The chorus on Aria Nova latest single is huge.', time: '3m' },
    { id: 2, sender: 'Miles', message: 'Anyone building a weekend pop playlist?', time: '2m' },
  ],
  rock: [
    { id: 3, sender: 'Theo', message: 'That live drum mix from Static Void is wild.', time: '6m' },
    { id: 4, sender: 'Rae', message: 'Drop more garage rock recs please.', time: '4m' },
  ],
  jazz: [
    { id: 5, sender: 'Nia', message: 'The new trio record has a gorgeous ride cymbal sound.', time: '8m' },
    { id: 6, sender: 'Owen', message: 'Late-night standards session at 9?', time: '5m' },
  ],
  electronic: [
    { id: 7, sender: 'Juno', message: 'Cyber Phonic is previewing a new synth line tonight.', time: '1m' },
    { id: 8, sender: 'You', message: 'I am here for anything with that green-room bass.', time: 'Now', mine: true },
  ],
  hiphop: [
    { id: 9, sender: 'Kai', message: 'Need more sample-heavy records from this week.', time: '7m' },
    { id: 10, sender: 'Mara', message: 'Verse chain starts after the next drop.', time: '4m' },
  ],
  ambient: [
    { id: 11, sender: 'Sol', message: 'Ambient Field focus session starts in ten.', time: '9m' },
    { id: 12, sender: 'Iris', message: 'Soft pads only today. My brain says thanks.', time: '5m' },
  ],
}

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState('electronic')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [messagesByRoom, setMessagesByRoom] = useState(startingMessages)

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0]
  const visibleRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return rooms
    }

    return rooms.filter((room) =>
      `${room.name} ${room.genre} ${room.topic}`.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const roomMessages = messagesByRoom[selectedRoom.id] ?? []

  const sendMessage = (event) => {
    event.preventDefault()
    const message = draft.trim()

    if (!message) {
      return
    }

    setMessagesByRoom((currentMessages) => ({
      ...currentMessages,
      [selectedRoom.id]: [
        ...(currentMessages[selectedRoom.id] ?? []),
        {
          id: Date.now(),
          sender: 'You',
          message,
          time: 'Now',
          mine: true,
        },
      ],
    }))
    setDraft('')
  }

  return (
    <div className="chat-page-shell">
      <aside className="sidebar chat-sidebar">
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

      <header className="topbar chat-topbar">
        <div className="topbar-left">
          <span className="mobile-brand">BassDrop</span>
          <label className="search-shell chat-search-shell" aria-label="Search chat rooms">
            <span className="material-symbols-outlined">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rooms, genres, or artist groups..."
              type="search"
            />
          </label>
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

      <main className="content chat-content">
        <section className="chat-hero">
          <div>
            <span className="eyebrow">Community Hub</span>
            <h1>Find your room, meet your sound.</h1>
          </div>
          <div className="chat-hero-stats" aria-label="Community stats">
            <div>
              <strong>86k</strong>
              <span>Members</span>
            </div>
           <div>
            <strong>4.3k</strong>
            <span>Online</span>
           </div>
          </div>
        </section>

        <section className="chat-layout-grid">
          <div className="chat-room-column">
            <div className="section-header chat-section-header">
              <h2>Genre Rooms</h2>
              <span>{visibleRooms.length} rooms</span>
            </div>

            <div className="chat-room-grid">
              {visibleRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={`chat-room-card ${room.id === selectedRoom.id ? 'active' : ''}`}
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{ '--room-accent': room.accent }}
                >
                  <img src={room.image} alt={`${room.genre} chat room`} />
                  <span className="chat-room-overlay" />
                  <div>
                    <span>{room.genre}</span>
                    <h3>{room.name}</h3>
                    <p>{room.topic}</p>
                  </div>
                  <footer>
                    <span>{room.members} members</span>
                    <strong>{room.online} online</strong>
                  </footer>
                </button>
              ))}
            </div>
          </div>

          <section className="chat-room-panel" aria-label={`${selectedRoom.name} chat`}>
            <div className="chat-room-panel-header" style={{ '--room-accent': selectedRoom.accent }}>
              <div>
                <span className="material-symbols-outlined">forum</span>
                <div>
                  <h2>{selectedRoom.name}</h2>
                  <p>{selectedRoom.topic}</p>
                </div>
              </div>
              <span>{selectedRoom.online} online</span>
            </div>

            <div className="chat-room-message-list">
              {roomMessages.map((message) => (
                <article key={message.id} className={`chat-room-message ${message.mine ? 'mine' : ''}`}>
                  <div>
                    <strong>{message.sender}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p>{message.message}</p>
                </article>
              ))}
            </div>

            <form className="chat-room-form" onSubmit={sendMessage}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${selectedRoom.name}...`}
              />
              <button type="submit" aria-label="Send chat message">
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </section>

        </section>
      </main>

      <nav className="mobile-nav chat-mobile-nav">
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

export default Chat
