import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'
import { usePlayer } from '../../context/PlayerContext'
import { apiFetch } from '../../lib/api'
import { API_ORIGIN, mediaUrl } from '../../lib/format'
import ProfileMenu from '../../components/ProfileMenu'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat', active: true },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  { icon: 'queue_music', label: 'Playlists', href: '/playlists' },
]

const roomAccents = ['#f472b6', '#fb7185', '#fbbf24', '#72fe8f', '#a78bfa', '#88ebff']

const Chat = () => {
  const { token, user } = useAuth()
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer()
  const socketRef = useRef(null)

  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [shareQuery, setShareQuery] = useState('')
  const [shareResults, setShareResults] = useState([])
  const [genreSongs, setGenreSongs] = useState([])

  const loadRooms = () => {
    if (!token) return
    apiFetch('/chats', { token })
      .then(({ chats }) => {
        setRooms(chats)
        setSelectedRoomId((current) => current ?? chats[0]?.id ?? null)
      })
      .catch(() => {})
  }

  useEffect(loadRooms, [token])

  // One socket connection for the page's lifetime, authenticated the same way as the API.
  useEffect(() => {
    if (!token) return undefined

    const socket = io(API_ORIGIN, { auth: { token } })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('chat:message', (message) => {
      setMessagesByRoom((current) => ({
        ...current,
        [message.chatId]: [...(current[message.chatId] ?? []), message],
      }))
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  // Joining a room persists membership server-side and subscribes this socket to it.
  useEffect(() => {
    if (!connected || !selectedRoomId || !token) return

    socketRef.current?.emit('chat:join', selectedRoomId, (ack) => {
      if (!ack?.ok) setError(ack?.error ?? 'Could not join room')
    })

    apiFetch(`/chats/${selectedRoomId}/messages`, { token })
      .then(({ messages }) => setMessagesByRoom((current) => ({ ...current, [selectedRoomId]: messages })))
      .catch(() => {})
  }, [connected, selectedRoomId, token])

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null
  const visibleRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return rooms
    return rooms.filter((room) =>
      `${room.name} ${room.genre?.name ?? ''}`.toLowerCase().includes(normalizedQuery),
    )
  }, [query, rooms])

  const roomMessages = selectedRoomId ? messagesByRoom[selectedRoomId] ?? [] : []

  // Closing the share panel and resetting its search when the room changes
  // avoids sharing a song from one genre room's picker into a different one.
  useEffect(() => {
    setShareOpen(false)
    setShareQuery('')
  }, [selectedRoomId])

  // Each room is tied to one genre — surface that genre's songs as quick picks
  // to share, instead of only a blank search box.
  useEffect(() => {
    const genreId = selectedRoom?.genre?.id
    if (!genreId) {
      setGenreSongs([])
      return
    }
    apiFetch(`/songs?genreId=${genreId}&take=8`)
      .then(({ songs }) => setGenreSongs(songs))
      .catch(() => {})
  }, [selectedRoom?.genre?.id])

  useEffect(() => {
    const trimmed = shareQuery.trim()
    if (!trimmed) {
      setShareResults([])
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      apiFetch(`/search?q=${encodeURIComponent(trimmed)}&type=songs`)
        .then(({ songs }) => {
          if (!cancelled) setShareResults(songs)
        })
        .catch(() => {})
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [shareQuery])

  const shareSong = (songId) => {
    if (!selectedRoomId) return
    socketRef.current?.emit('chat:message', { chatId: selectedRoomId, sharedSongId: songId }, (ack) => {
      if (!ack?.ok) setError(ack?.error ?? 'Could not share song')
    })
    setShareOpen(false)
    setShareQuery('')
  }

  const shareablesSongs = shareQuery.trim() ? shareResults : genreSongs

  const ChatSharedSong = ({ song }) => {
    const isActive = currentSong?.id === song.id
    const isActivePlaying = isActive && isPlaying

    return (
      <Link to={`/song/${song.id}`} className={`chat-shared-song ${isActivePlaying ? 'playing' : ''}`}>
        <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt={song.title} />
        <span className="chat-shared-song-copy">
          <strong>{song.title}</strong>
          <small>{song.artist.name}</small>
        </span>
        <button
          type="button"
          className={`icon-button chat-shared-song-play ${isActivePlaying ? 'active' : ''}`}
          aria-label={isActivePlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          onClick={(event) => {
            event.preventDefault()
            if (isActive) togglePlay()
            else playSong(song, [song])
          }}
        >
          <span className="material-symbols-outlined filled">{isActivePlaying ? 'pause' : 'play_arrow'}</span>
        </button>
      </Link>
    )
  }

  const sendMessage = (event) => {
    event.preventDefault()
    const body = draft.trim()
    if (!body || !selectedRoomId) return

    socketRef.current?.emit('chat:message', { chatId: selectedRoomId, body }, (ack) => {
      if (!ack?.ok) setError(ack?.error ?? 'Could not send message')
    })
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
              placeholder="Search rooms or genres..."
              type="search"
            />
          </label>
        </div>

        <div className="topbar-actions">
          <ProfileMenu />
        </div>
      </header>

      <main className="content chat-content">
        <section className="hero-copy chat-hero-copy">
          <h2>Find your room, meet your sound.</h2>
          <p>
            {rooms.length} rooms · {rooms.reduce((sum, room) => sum + room.memberCount, 0)} members
          </p>
        </section>

        {error && <p style={{ color: '#fb7185', padding: '0 1rem' }}>{error}</p>}

        <section className="chat-genre-tabs-section">
          <div className="section-header chat-section-header">
            <h2>Genre Rooms</h2>
            <span>{visibleRooms.length} rooms</span>
          </div>

          <div className="chat-genre-tabs">
            {visibleRooms.map((room, index) => (
              <button
                key={room.id}
                type="button"
                className={`chat-genre-tab ${room.id === selectedRoomId ? 'active' : ''}`}
                onClick={() => setSelectedRoomId(room.id)}
                style={{ '--room-accent': roomAccents[index % roomAccents.length] }}
              >
                <span className="chat-genre-tab-name">{room.name}</span>
                <span className="chat-genre-tab-meta">{room.memberCount} members</span>
              </button>
            ))}
            {visibleRooms.length === 0 && <p>No rooms yet.</p>}
          </div>
        </section>

        <section className="chat-panel-section">
          {selectedRoom && (
            <section className="chat-room-panel" aria-label={`${selectedRoom.name} chat`}>
              <div
                className="chat-room-panel-header"
                style={{
                  '--room-accent':
                    roomAccents[rooms.findIndex((room) => room.id === selectedRoom.id) % roomAccents.length],
                }}
              >
                <div>
                  <span className="material-symbols-outlined">forum</span>
                  <div>
                    <h2>{selectedRoom.name}</h2>
                    <p>{selectedRoom.genre?.name ?? 'General'}</p>
                  </div>
                </div>
                <span>{selectedRoom.memberCount} members</span>
              </div>

              <div className="chat-room-message-list">
                {roomMessages.map((message) => (
                  <article
                    key={message.id}
                    className={`chat-room-message ${message.user.id === user?.id ? 'mine' : ''}`}
                  >
                    <div>
                      <strong>{message.user.name}</strong>
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {message.sharedSong && <ChatSharedSong song={message.sharedSong} />}
                    {message.body && <p>{message.body}</p>}
                  </article>
                ))}
                {roomMessages.length === 0 && <p>No messages yet — say hello.</p>}
              </div>

              {shareOpen && (
                <div className="chat-share-panel">
                  <label className="chat-share-search">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      value={shareQuery}
                      onChange={(event) => setShareQuery(event.target.value)}
                      placeholder={`Search songs, or pick a ${selectedRoom.genre?.name ?? ''} track…`}
                      autoFocus
                    />
                  </label>
                  <div className="chat-share-results">
                    {shareablesSongs.map((song) => (
                      <button
                        key={song.id}
                        type="button"
                        className="chat-share-result"
                        onClick={() => shareSong(song.id)}
                      >
                        <img src={song.coverUrl ? mediaUrl(song.coverUrl) : undefined} alt="" />
                        <span>
                          <strong>{song.title}</strong>
                          <small>{song.artist.name}</small>
                        </span>
                      </button>
                    ))}
                    {shareablesSongs.length === 0 && (
                      <p>{shareQuery.trim() ? 'No songs found.' : 'No songs in this genre yet.'}</p>
                    )}
                  </div>
                </div>
              )}

              <form className="chat-room-form" onSubmit={sendMessage}>
                <button
                  type="button"
                  className={`icon-button chat-share-toggle ${shareOpen ? 'active' : ''}`}
                  aria-label="Share a song"
                  onClick={() => setShareOpen((current) => !current)}
                >
                  <span className="material-symbols-outlined">music_note</span>
                </button>
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
          )}
        </section>
      </main>

      <nav className="mobile-nav chat-mobile-nav">
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

export default Chat
