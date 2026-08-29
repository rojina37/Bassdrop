import React from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  { icon: 'admin_panel_settings', label: 'Admin', href: '/admin', active: true },
]

const backgroundImage = []

const statCards = [
  {
    icon: 'graphic_eq',
    label: 'Total Streams',
    value: '4.2M',
    trend: '+12.5%',
    trendIcon: 'trending_up',
    tone: 'primary',
  },
  {
    icon: 'headphones',
    label: 'Active Listeners',
    value: '128.4k',
    trend: '+5.2k',
    trendIcon: 'trending_up',
    tone: 'tertiary',
  },
  {
    icon: 'person_add',
    label: 'New Artists',
    value: '842',
    trend: 'Stable',
    tone: 'secondary',
    mutedTrend: true,
  },
  {
    icon: 'payments',
    label: 'Revenue',
    value: '$52.8k',
    trend: '+8.1%',
    trendIcon: 'trending_up',
    tone: 'success',
  },
]

const streamBars = [
  { day: 'Mon', height: 40 },
  { day: 'Tue', height: 65 },
  { day: 'Wed', height: 85, active: true },
  { day: 'Thu', height: 55 },
  { day: 'Fri', height: 90 },
  { day: 'Sat', height: 70 },
  { day: 'Sun', height: 45 },
]

const topGenres = [
  { name: 'Lo-Fi Hip Hop', value: 42, tone: 'primary' },
  { name: 'Synthwave', value: 28, tone: 'tertiary' },
  { name: 'Deep House', value: 15, tone: 'secondary' },
  { name: 'Ambient', value: 10, tone: 'muted' },
]

const activities = [
  {
    icon: 'security',
    title: 'Suspicious Login Attempt',
    detail: 'Admin access from unauthorized IP: 192.168.1.104',
    time: '2m ago',
    tone: 'error',
  },
  {
    icon: 'shopping_cart',
    title: 'Large Subscription Renewal',
    detail: 'Artist "Echo Pulse" upgraded to Studio Tier',
    time: '15m ago',
    tone: 'primary',
  },
  {
    icon: 'cloud_upload',
    title: 'Bulk Track Upload',
    detail: 'Label "Blue Records" uploaded 150 tracks',
    time: '1h ago',
    tone: 'tertiary',
  },
  {
    icon: 'verified_user',
    title: 'Artist Verification Success',
    detail: 'Identity confirmed for "Neon Drift"',
    time: '3h ago',
    tone: 'secondary',
  },
]

const systemActions = [
  { icon: 'cleaning_services', label: 'Purge Cache' },
  { icon: 'rebase_edit', label: 'API Rebuild' },
  { icon: 'database', label: 'Snapshot' },
  { icon: 'emergency_home', label: 'Maintenance', danger: true },
]

const userProfile =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBmB7FSdXaxKDKMgnDiNY8MZq4rnrAEKFgy5GxN2o-XZEC7D3PiqWjc8wdeToH7ZDLeLi7DlCBUpzZwigzhDKRcju-pI_3yJQnSD0imzXRYnUz2RkNIQqb0hwkya1yhjwY46pkI7yxJqFWfvtn4aHgtsC-Qnb6u_XGQfaCOPpMEybBTSmolVx-5xrKkuBpRddlY36loB-JXgp4JmtiVaSXc5bCNOvnalRQx2jUT0961wNby0eZhZCFsiuPcziMDRZx_dSJen8ItFT4'

const currentTrack =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAR1PS8AcZlPVZjs3yKsy9oLykPCV7gVy0lLjye-NseBnJYOTcH_KegGuEyKpPnzZyvPvw9B7P23LqQoQgFcwNbbNeQaivkfefaOeN-ziwEUkKib7hU-syVpVJmSADRTu4Ku9TITdk2U0SQOicAfuHnqVnXiBAuT5G-HBsnhQCLgcdlzXsTRGuzfnZLGtej770ZF4V_8G9CwnSx5Sy_NZ5UxPhp3zuUAVXJXnPh-m4SiiL2TuYCEBl12D1VD_dDrJYV9-uEUz1vBvc'

const playerControls = ['shuffle', 'skip_previous', 'play_circle', 'skip_next', 'repeat']

const Admin = () => {
  return (
    <div className="admin-page-shell">
      <aside className="sidebar admin-sidebar">
        <div className="brand-block admin-brand-block">
           <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full'/>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`nav-link ${item.active ? 'active' : ''}`}
            >
              <span
                className={`material-symbols-outlined ${item.active ? 'admin-nav-icon-active' : ''}`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-status-card">
          <p>System Status</p>
          <div>
            <span className="admin-status-dot" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </aside>

      <header className="topbar admin-topbar">
        <div className="topbar-left">
          <span className="mobile-brand">Sonic</span>
          <h2>Platform Health</h2>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-button admin-alert-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="admin-alert-badge" />
          </button>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <img className="profile-avatar" src={userProfile} alt="User profile" />
        </div>
      </header>

      <main className="content admin-content">
        <div className="admin-canvas">
          <section className="admin-stats-grid" aria-label="Realtime statistics">
            {statCards.map((stat) => (
              <article key={stat.label} className="admin-stat-card inner-glow">
                <div className="admin-card-topline">
                  <span className={`material-symbols-outlined admin-tone-${stat.tone}`}>
                    {stat.icon}
                  </span>
                  <span className={`admin-stat-trend ${stat.mutedTrend ? 'muted' : ''}`}>
                    {stat.trend}
                    {stat.trendIcon ? (
                      <span className="material-symbols-outlined">{stat.trendIcon}</span>
                    ) : null}
                  </span>
                </div>
                <div>
                  <p>{stat.label}</p>
                  <h3>{stat.value}</h3>
                </div>
              </article>
            ))}
          </section>

          <section className="admin-main-grid">
            <article className="admin-panel admin-chart-card">
              <div className="admin-panel-header">
                <div>
                  <h3>Streaming Trends</h3>
                  <p>Global performance over the last 30 days</p>
                </div>
                <div className="admin-header-actions">
                  <button type="button" className="admin-secondary-button">
                    Export CSV
                  </button>
                  <button type="button" className="admin-primary-button">
                    Real-time
                  </button>
                </div>
              </div>

              <div className="admin-stream-chart">
                {streamBars.map((bar) => (
                  <div key={bar.day} className="admin-bar-column">
                    <div
                      className={`admin-stream-bar ${bar.active ? 'active' : ''}`}
                      style={{ height: `${bar.height}%` }}
                    />
                    <span className={bar.active ? 'active' : ''}>{bar.day}</span>
                  </div>
                ))}
              </div>
              <div className="admin-chart-glow" aria-hidden="true" />
            </article>

            <article className="admin-panel admin-genres-card">
              <h3>Top Genres</h3>
              <div className="admin-genre-list">
                {topGenres.map((genre) => (
                  <div key={genre.name} className="admin-genre-row">
                    <div>
                      <span>{genre.name}</span>
                      <span>{genre.value}%</span>
                    </div>
                    <div className="admin-progress-track">
                      <div
                        className={`admin-progress-fill admin-fill-${genre.tone}`}
                        style={{ width: `${genre.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-bottom-grid">
            <article className="admin-panel admin-activity-panel">
              <div className="admin-list-header">
                <h3>Recent Activities</h3>
                <button type="button" className="icon-button" aria-label="Filter activities">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>

              <div className="admin-activity-list">
                {activities.map((activity) => (
                  <article key={activity.title} className="admin-activity-row">
                    <div className="admin-activity-main">
                      <div className={`admin-activity-icon admin-activity-${activity.tone}`}>
                        <span className="material-symbols-outlined">{activity.icon}</span>
                      </div>
                      <div>
                        <h4>{activity.title}</h4>
                        <p>{activity.detail}</p>
                      </div>
                    </div>
                    <span className="admin-activity-time">{activity.time}</span>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </div>
      </main>

      <footer className="player-bar admin-player-bar">
        <div className="player-now-playing">
          <div className="now-art admin-now-art">
            <img src={currentTrack} alt="Current track" />
          </div>
          <div className="now-meta">
            <h4>System Monitor Active</h4>
            <p>Node: AWS-USE-1A</p>
          </div>
        </div>

        <div className="player-controls">
          <div className="control-row">
            {playerControls.map((icon) => (
              <button
                key={icon}
                type="button"
                className={icon === 'play_circle' ? 'admin-play-control' : 'icon-button light'}
                aria-label={icon.replace('_', ' ')}
              >
                <span className={`material-symbols-outlined ${icon === 'play_circle' ? 'filled' : ''}`}>
                  {icon}
                </span>
              </button>
            ))}
          </div>
          <div className="progress-row admin-progress-row">
            <span>04:20</span>
            <div className="progress-bar admin-player-progress">
              <div className="progress-current admin-player-current" />
              <div className="admin-player-thumb" />
            </div>
            <span>06:00</span>
          </div>
        </div>

        <div className="player-extra">
          <button type="button" className="icon-button light" aria-label="Playlist">
            <span className="material-symbols-outlined">playlist_play</span>
          </button>
          <button type="button" className="icon-button light" aria-label="Devices">
            <span className="material-symbols-outlined">devices</span>
          </button>
          <div className="volume-shell admin-volume-shell">
            <span className="material-symbols-outlined">volume_up</span>
            <div className="volume-bar">
              <div className="volume-current admin-volume-current" />
            </div>
          </div>
        </div>
      </footer>

      <nav className="mobile-nav admin-mobile-nav">
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

export default Admin
