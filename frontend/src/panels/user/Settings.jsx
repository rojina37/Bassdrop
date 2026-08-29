import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const topAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-r-xL-C9qf0m-72J06RA81T0cruNqb-PwsjaWyt4M2wqvp1MteaGapjgsd-bymXvjt7Sq_JE6_JVxUf1ViCSaVPaSmbMoBL0VAsO4yKyMix0nc24hY9igoj01mKnbpT75I7sHsFWIsfyrsJwiD02eqLxdvpqYoko_LGjytx9KjAPb_McHNorLaDeBahDBXjjxBes4gggKaQQrTEUndCXaXgn-Wngm0fqZASCUQFNVGhve59DTGZnVZe-y5RooP9OYevZdyGlcwF0'

const profileAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuClEEr_OPUiAvxsMlWM77-CArADlSEKasEJ1RSSGzDWcdLj8TGafu309TPjlxYRXJByzJ5sLBTMrsptNeKMhhq5FgDDeXqZ2Ob6jH3D5J72AVsoSSk2oUco35OAu7pNE5GkpWJ3cK6kzBF2nIdZe3TZ2ZXSP9GQHicZ-1UmXq4hanrJNvIw73e9D-6YGgulusrRGJKQoW1piy3SuUiAibKHYI0zil287zkpMxhwYJNxJwqSorsMaiMVmqCTNntdd6N9XuzbSc9WiOU'

const albumArt =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAS1Wqh_7z8QPGelX25UbvPrMPTV4bX-rC41l3smVAcBwOCvqasNVVAK6cc6ZpO6Yc15liGav9ZUQ4F63s6jcTwE0bROxKh69dwcMOsZfIFhFzd--lEjPYt8gc-yGbae0_p65VtbkYcpQ1GNnY2brAa6DuYZ-enha9GefCQ06lUbRkQZLF4Y8jGT-3-Ze1xM2mqpHbxwXY0bwrOKUhnmRK93ZjPHIDWyhBlNCemuoK9hOmpJDoenAzbQZFx77Y4F4g5BfsPwTRhG0o'

const sidebarLinks = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'explore', label: 'Browse', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Library', href: '/library' },
]

const footerLinks = [
  { icon: 'favorite', label: 'Liked Songs', href: '/library' },
  { icon: 'playlist_play', label: 'Playlists', href: '/library' },
]

const playerControls = ['shuffle', 'skip_previous', 'play_arrow', 'skip_next', 'repeat']

const mobileNav = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'explore', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Library', href: '/library' },
  { icon: 'settings', label: 'Settings', href: '/settings', active: true },
]

const Settings = () => {
  const [account, setAccount] = useState({
    displayName: 'Alex Rivera',
    email: 'alex.rivera@sonic-audio.com',
  })
  const [playlistName, setPlaylistName] = useState('')
  const [playlists, setPlaylists] = useState([])
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
  })

  const updateAccount = (event) => {
    const { name, value } = event.target
    setAccount((current) => ({ ...current, [name]: value }))
  }

  const updatePassword = (event) => {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
  }

  const addPlaylist = (event) => {
    event.preventDefault()
    const normalizedName = playlistName.trim()

    if (!normalizedName) {
      return
    }

    setPlaylists((current) => [normalizedName, ...current].slice(0, 3))
    setPlaylistName('')
  }

  const closePasswordForm = () => {
    setIsPasswordFormOpen(false)
    setPasswords({ current: '', next: '' })
  }

  const updatePasswordForm = (event) => {
    event.preventDefault()
    closePasswordForm()
  }

  return (
    <div className="settings-lite-page">
      <header className="settings-lite-topbar">
        <Link to="/" className="settings-lite-logo">
          Sonic
        </Link>

        <div className="settings-lite-top-actions">
          <label className="settings-lite-search">
            <span className="material-symbols-outlined">search</span>
            <input type="search" placeholder="Search settings..." />
          </label>

          <button type="button" className="settings-lite-icon-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/settings" className="settings-lite-icon-button active" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <img className="settings-lite-top-avatar" src={topAvatar} alt="User profile" />
        </div>
      </header>

      <aside className="settings-lite-sidebar">
        <div className="settings-lite-sidebar-brand">
          <div>
            <span className="material-symbols-outlined filled">graphic_eq</span>
          </div>
          <div>
            <h2>Sonic</h2>
            <p>Premium Audio</p>
          </div>
        </div>

        <nav className="settings-lite-sidebar-nav" aria-label="Main navigation">
          {sidebarLinks.map((item) => (
            <Link key={item.label} to={item.href}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button type="button" className="settings-lite-upgrade-button">
          Upgrade to Pro
        </button>

        <nav className="settings-lite-sidebar-footer" aria-label="Library shortcuts">
          {footerLinks.map((item) => (
            <Link key={item.label} to={item.href}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="settings-lite-main">
        <div className="settings-lite-container">
          <header className="settings-lite-heading">
            <h1>Settings</h1>
            <p>Update your account info and keep your profile secure.</p>
          </header>

          <div className="settings-lite-stack">
            <section className="settings-lite-card settings-lite-account-card">
              <div className="settings-lite-card-heading">
                <span className="material-symbols-outlined">account_circle</span>
                <h2>Account Overview</h2>
              </div>

              <div className="settings-lite-account-grid">
                <button type="button" className="settings-lite-avatar-editor" aria-label="Change profile photo">
                  <img src={profileAvatar} alt="Profile avatar" />
                  <span className="material-symbols-outlined">photo_camera</span>
                </button>

                <div className="settings-lite-account-fields">
                  <div className="settings-lite-field-grid">
                    <label>
                      <span>Display Name</span>
                      <input
                        name="displayName"
                        value={account.displayName}
                        onChange={updateAccount}
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        name="email"
                        type="email"
                        value={account.email}
                        onChange={updateAccount}
                      />
                    </label>
                  </div>

                  <div className="settings-lite-plan-strip">
                    <button type="button">Get Started</button>
                  </div>
                </div>
              </div>
            </section>

            <div className="settings-lite-card-grid">
              <section className="settings-lite-card settings-lite-action-card">
                <div className="settings-lite-card-heading">
                  <span className="material-symbols-outlined">add_circle</span>
                  <h2>Create Playlist</h2>
                </div>

                <form className="settings-lite-playlist-form" onSubmit={addPlaylist}>
                  <label>
                    <span>Playlist Name</span>
                    <input
                      value={playlistName}
                      onChange={(event) => setPlaylistName(event.target.value)}
                      placeholder="E.g., Midnight Vibes"
                    />
                  </label>
                  <p>Playlists help you organize your favorite tracks and discover more of what you love.</p>

                  {playlists.length > 0 ? (
                    <div className="settings-lite-playlist-list">
                      {playlists.map((playlist) => (
                        <span key={playlist}>{playlist}</span>
                      ))}
                    </div>
                  ) : null}

                  <button type="submit">Add Playlist</button>
                </form>
              </section>

              <section className="settings-lite-card settings-lite-action-card" id="security-section">
                <div className="settings-lite-card-heading">
                  <span className="material-symbols-outlined">security</span>
                  <h2>Security</h2>
                </div>

                {!isPasswordFormOpen ? (
                  <button
                    type="button"
                    className="settings-lite-password-launch"
                    onClick={() => setIsPasswordFormOpen(true)}
                  >
                    <span className="material-symbols-outlined">lock_reset</span>
                    Change Password
                  </button>
                ) : (
                  <form className="settings-lite-password-form" onSubmit={updatePasswordForm}>
                    <label>
                      <span>Current Password</span>
                      <input
                        name="current"
                        type="password"
                        value={passwords.current}
                        onChange={updatePassword}
                        placeholder="Current password"
                      />
                    </label>
                    <label>
                      <span>New Password</span>
                      <input
                        name="next"
                        type="password"
                        value={passwords.next}
                        onChange={updatePassword}
                        placeholder="Enter new password"
                      />
                    </label>
                    <button type="submit">Update Password</button>
                    <button type="button" onClick={closePasswordForm}>
                      Cancel
                    </button>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="settings-lite-player-bar">
        <div className="settings-lite-now-playing">
          <img src={albumArt} alt="Midnight City album art" />
          <div>
            <strong>Midnight City</strong>
            <p>The Curators</p>
          </div>
          <button type="button" className="settings-lite-icon-button" aria-label="Favorite">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>

        <div className="settings-lite-player-controls">
          <div>
            {playerControls.map((icon) => (
              <button
                key={icon}
                type="button"
                className={icon === 'play_arrow' ? 'settings-lite-play-button' : 'settings-lite-icon-button'}
                aria-label={icon.replace('_', ' ')}
              >
                <span className={`material-symbols-outlined ${icon === 'play_arrow' ? 'filled' : ''}`}>
                  {icon}
                </span>
              </button>
            ))}
          </div>

          <div className="settings-lite-progress-row">
            <span>2:14</span>
            <div>
              <i />
              <b />
            </div>
            <span>4:32</span>
          </div>
        </div>

        <div className="settings-lite-player-tools">
          {['lyrics', 'queue_music'].map((icon) => (
            <button key={icon} type="button" className="settings-lite-icon-button" aria-label={icon}>
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
          <div className="settings-lite-volume">
            <span className="material-symbols-outlined">volume_up</span>
            <div>
              <span />
            </div>
          </div>
        </div>
      </footer>

      <nav className="settings-lite-mobile-nav" aria-label="Mobile navigation">
        {mobileNav.map((item) => (
          <Link key={item.label} to={item.href} className={item.active ? 'active' : ''}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Settings
