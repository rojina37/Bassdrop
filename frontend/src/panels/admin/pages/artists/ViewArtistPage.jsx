import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const adminNavItems = [
  { icon: 'monitoring', label: 'Analytics', href: '/admin' },
  { icon: 'library_music', label: 'Content', href: '/admin/view/song' },
  { icon: 'group', label: 'Users', href: '/admin/view/artist', active: true },
  { icon: 'settings', label: 'Settings', href: '#' },
]

const artistProfile =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDRI_55ZF2Ezphq-YSZbk0CKRjxk4uzcPYEJReW1ioLYWBjbaWbN9b0vhTV693iCbfeorXVSyLiDcL3HAxogUtCd377CwfKJ1pd2Pu1GTofLAnxTI1C3WFqJ2cnzgRaMjevIL8fT0J0s9jPsBL2HYvVjr2vjNSUH1bH80MMDrR-oQzb09AQouKEbIx19qberrK4Geb9i3QzmUAMUVWiFUBTZeEqHjm1AFSwqzp1kQevgQlee433nre5mR-IHuZemzxVXO_YzdyxLVo'

const adminAvatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5UC5XxyD50_qLeJqZkph6EYdnqmeggNUwUfdeHFswLVcmINT_KRI4SFE4yPkJy0r0gNFZGsZ-PD9mFvNroslZXl1ik11S0fbhFmJtdndLReHkTM7YfOD1xZV-UW0tDouXSU2cXecGkJ4Y8IMQ0ddsVSdyhGjfEwiNnS03TZSOXUWYJ9QacJbRT7OHu-LAAXsegUxeiKw1ZexCFb1RMLKyezDxMMOs1cRNOqs_Svu2X_Fjo8fBLN8xedlqhmefN3Fl_gqBOqtal-M'

const growthBars = [40, 55, 45, 70, 65, 85, 100]

const demographics = [
  { label: '18-24 Years', value: 45 },
  { label: '25-34 Years', value: 32 },
  { label: '35-44 Years', value: 16 },
]

const initialTracks = [
  {
    id: 1,
    title: 'Neon Pulse',
    meta: 'Album: Digital Echoes',
    streams: '1.2M',
    releaseDate: 'Jan 12, 2023',
    status: 'Live',
    trend: 'M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L64 8',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArUXimsFjONcvjKMuswVHFZomwyBhVW7g3u0hhuJ-1S7lwJR_GMuDeOIduUC4qrc2F7-evgfbmZMHkIGBx2qKWOFVraDN7xWxkSpOIqAmgzaU5w1wWNIO31RCkOSXPaq5sjCQZy_K1o4RF5YFlTr6l8-n0ShsTtaRTEFR7GL49bNdqtWBycP4lf4pv0CY2w6quQPOV0GCREUUHkBKd23XJrGG1VOHVRTCXO_2KewymaJ_tKRRL9U2dDEfnIFAeFyBW3weZvqdoXh8',
  },
  {
    id: 2,
    title: 'Obsidian Dream',
    meta: 'Single - 2023',
    streams: '856K',
    releaseDate: 'Aug 24, 2023',
    status: 'Pending',
    trend: 'M0 15 L10 18 L20 12 L30 14 L40 8 L50 10 L64 2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCgaMDzOfTyYPXx3Fx9ljTngs9_Sq1X4eS4nFfagxMvfnzAbC1wlwDQUaWzAhenyZG1JqIY-IGR71vc6WVaCAO8y8Wj5_fYY3gIUONL8oxk5MeukxWG6PzeegiQsXBNR__VX06CCvF3L8NCeUr7jvoMVhDAs-xVEpnmG46uE7fCtCvgPeuiu-kT1OSX3Y4MhqOZblKoWmq_d9oaSMQ1osRZiXZATZbd2FpetNHRGfNVWTF6g1GIWZMrawtT8RL7vwerXXUf7A6LBIo',
  },
  {
    id: 3,
    title: 'Void Walker',
    meta: 'Draft Release',
    streams: '--',
    releaseDate: '--',
    status: 'Draft',
    trend: '',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBuJyJhPE4yzuxL7ItWoo9fOvSmQqS6Iy447OBo51xcTTKReCHp4-hJ2J2wD0wGFR9w4qlIUudVg6M9VRli7GB6LySotRj_e_fn1AS0ueLBE4VMpi2AinP7fkABUYkvGIgpS4zSjeloJqWCjtwtKYMzxD6cCknEGlNgLvTuHGtwl_jK_blamQaeptFi9BexRnY81Li-gl6cOMRAlrZAuMCo0QTQA7QZCnhH7AgFwd83F_pxFFqsQqCdgKBTIJa73qkmsqbf1o_G7SA',
  },
]

const emptyTrackForm = {
  title: '',
  meta: '',
  streams: '',
  releaseDate: '',
  status: 'Draft',
  image: '',
}

const statusClasses = {
  Live: 'artist-status-live',
  Pending: 'artist-status-pending',
  Draft: 'artist-status-draft',
}

const ViewArtistPage = () => {
  const [tracks, setTracks] = useState(initialTracks)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [selectedTrackIds, setSelectedTrackIds] = useState([])
  const [trackForm, setTrackForm] = useState(emptyTrackForm)
  const [editingTrackId, setEditingTrackId] = useState(null)
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false)

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tracks.filter((track) => {
      const matchesStatus = statusFilter === 'All Status' || track.status === statusFilter
      const matchesQuery =
        !normalizedQuery ||
        `${track.title} ${track.meta} ${track.releaseDate} ${track.status}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesStatus && matchesQuery
    })
  }, [query, statusFilter, tracks])

  const allFilteredSelected =
    filteredTracks.length > 0 && filteredTracks.every((track) => selectedTrackIds.includes(track.id))

  const openCreateDialog = () => {
    setTrackForm(emptyTrackForm)
    setEditingTrackId(null)
    setIsTrackDialogOpen(true)
  }

  const openEditDialog = (track) => {
    setTrackForm({
      title: track.title,
      meta: track.meta,
      streams: track.streams === '--' ? '' : track.streams,
      releaseDate: track.releaseDate === '--' ? '' : track.releaseDate,
      status: track.status,
      image: track.image,
    })
    setEditingTrackId(track.id)
    setIsTrackDialogOpen(true)
  }

  const closeTrackDialog = () => {
    setIsTrackDialogOpen(false)
    setTrackForm(emptyTrackForm)
    setEditingTrackId(null)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setTrackForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleTrackSave = (event) => {
    event.preventDefault()

    const normalizedTrack = {
      title: trackForm.title.trim() || 'Untitled Track',
      meta: trackForm.meta.trim() || 'Unassigned Release',
      streams: trackForm.streams.trim() || '--',
      releaseDate: trackForm.releaseDate.trim() || '--',
      status: trackForm.status,
      image:
        trackForm.image.trim() ||
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=500&q=80',
      trend: 'M0 18 L10 14 L20 16 L30 9 L40 12 L50 7 L64 5',
    }

    if (editingTrackId) {
      setTracks((currentTracks) =>
        currentTracks.map((track) =>
          track.id === editingTrackId ? { ...track, ...normalizedTrack } : track,
        ),
      )
    } else {
      setTracks((currentTracks) => [
        {
          id: Date.now(),
          ...normalizedTrack,
        },
        ...currentTracks,
      ])
    }

    closeTrackDialog()
  }

  const deleteTrack = (trackId) => {
    setTracks((currentTracks) => currentTracks.filter((track) => track.id !== trackId))
    setSelectedTrackIds((currentIds) => currentIds.filter((id) => id !== trackId))
  }

  const toggleTrackSelection = (trackId) => {
    setSelectedTrackIds((currentIds) =>
      currentIds.includes(trackId)
        ? currentIds.filter((id) => id !== trackId)
        : [...currentIds, trackId],
    )
  }

  const toggleAllFilteredTracks = () => {
    if (allFilteredSelected) {
      const filteredIds = filteredTracks.map((track) => track.id)
      setSelectedTrackIds((currentIds) => currentIds.filter((id) => !filteredIds.includes(id)))
      return
    }

    setSelectedTrackIds((currentIds) => [
      ...new Set([...currentIds, ...filteredTracks.map((track) => track.id)]),
    ])
  }

  return (
    <div className="artist-admin-page">
      <aside className="artist-admin-sidebar" aria-label="Admin navigation">
        <div className="artist-admin-sidebar-inner">
          <div className="artist-admin-brand">
             <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full'/>
          </div>

          <nav className="artist-admin-nav">
            {adminNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`artist-admin-nav-link ${item.active ? 'active' : ''}`}
              >
                <span className={`material-symbols-outlined ${item.active ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <button type="button" className="artist-admin-upload-button">
            Upload Content
          </button>

          <div className="artist-admin-sidebar-footer">
            <button type="button">
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </button>
            <button type="button">
              <span className="material-symbols-outlined">terminal</span>
              <span>Logs</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="artist-admin-topbar">
        <div className="artist-admin-topbar-left">
          <strong>Sonic Obsidian Dashboard</strong>
          <nav className="artist-admin-top-links" aria-label="Dashboard sections">
            <Link to="/admin">Dashboard</Link>
            <Link className="active" to="/admin/view/artist">
              Reports
            </Link>
          </nav>
        </div>

        <div className="artist-admin-topbar-actions">
          <label className="artist-admin-search compact">
            <span className="material-symbols-outlined">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tracks..."
              type="search"
            />
          </label>

          <div className="artist-admin-icon-row">
            {['notifications', 'mail', 'admin_panel_settings'].map((icon) => (
              <button key={icon} type="button" className="artist-admin-icon-button" aria-label={icon}>
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>

          <img className="artist-admin-avatar-small" src={adminAvatar} alt="Admin avatar" />
        </div>
      </header>

      <main className="artist-admin-main">
        <section className="artist-admin-hero" aria-label="Artist summary">
          <div className="artist-admin-profile-image">
            <img src={artistProfile} alt="Cyber Phonic profile" />
            <span className="artist-admin-verified-mark">
              <span className="material-symbols-outlined filled">verified</span>
            </span>
          </div>

          <div className="artist-admin-hero-copy">
            <div className="artist-admin-kicker">
              <span>Verified Creator</span>
              <span>Active Since 2022</span>
            </div>
            <h1>Cyber Phonic</h1>

            <div className="artist-admin-stats">
              <div>
                <span>Total Followers</span>
                <strong>2.4M</strong>
              </div>
              <div>
                <span>Monthly Listeners</span>
                <strong>18.9M</strong>
              </div>
              <div>
                <span>Lifetime Streams</span>
                <strong>1.2B</strong>
              </div>
            </div>
          </div>

          <div className="artist-admin-hero-actions">
            <button type="button" className="artist-admin-plain-button">
              <span className="material-symbols-outlined">edit</span>
              Edit Profile
            </button>
            <button type="button" className="artist-admin-muted-button">
              <span className="material-symbols-outlined">mail</span>
              Message Artist
            </button>
          </div>
        </section>

        {/* <section className="artist-admin-analytics-grid" aria-label="Artist analytics">
          <article className="artist-admin-panel artist-admin-growth-card">
            <div className="artist-admin-panel-heading">
              <div>
                <h2>Streaming Growth</h2>
                <p>Last 30 days performance</p>
              </div>
              <select aria-label="Growth range" defaultValue="Monthly">
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>

            <div className="artist-admin-bar-chart">
              {growthBars.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className={index === growthBars.length - 1 ? 'active' : ''}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </article>

          <article className="artist-admin-panel artist-admin-demo-card">
            <h2>Demographics</h2>
            <div className="artist-admin-progress-list">
              {demographics.map((demo) => (
                <div key={demo.label} className="artist-admin-progress-row">
                  <div>
                    <span>{demo.label}</span>
                    <strong>{demo.value}%</strong>
                  </div>
                  <div className="artist-admin-progress-track">
                    <span style={{ width: `${demo.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section> */}

        <section className="artist-admin-catalog-grid">
          <div className="artist-admin-catalog-main">
            <div className="artist-admin-section-heading">
              <div>
                <h2>Catalog Management</h2>
                <p>Organize and track performance of all tracks and releases.</p>
              </div>
              <button type="button" className="artist-admin-primary-button" onClick={openCreateDialog}>
                <span className="material-symbols-outlined">add</span>
                Add New Track
              </button>
            </div>

            <article className="artist-admin-table-panel">
              <div className="artist-admin-table-toolbar">
                <label className="artist-admin-search">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by track title, album, or status..."
                    type="search"
                  />
                </label>

                <div className="artist-admin-filter-actions">
                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option>All Status</option>
                    <option>Live</option>
                    <option>Pending</option>
                    <option>Draft</option>
                  </select>
                  <button type="button" className="artist-admin-square-button" aria-label="Open filters">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>
              </div>

              <div className="artist-admin-table-scroll">
                <table className="artist-admin-track-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          aria-label="Select all visible tracks"
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleAllFilteredTracks}
                        />
                      </th>
                      <th>Track</th>
                      <th>Streams / Trend</th>
                      <th>Release Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((track) => (
                      <tr key={track.id}>
                        <td>
                          <input
                            aria-label={`Select ${track.title}`}
                            type="checkbox"
                            checked={selectedTrackIds.includes(track.id)}
                            onChange={() => toggleTrackSelection(track.id)}
                          />
                        </td>
                        <td>
                          <div className="artist-admin-track-cell">
                            <img src={track.image} alt={`${track.title} album art`} />
                            <div>
                              <strong>{track.title}</strong>
                              <span>{track.meta}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="artist-admin-trend-cell">
                            <strong>{track.streams}</strong>
                            {track.trend ? (
                              <svg viewBox="0 0 64 24" aria-hidden="true">
                                <path d={track.trend} />
                              </svg>
                            ) : (
                              <span className="artist-admin-empty-trend">--</span>
                            )}
                          </div>
                        </td>
                        <td>{track.releaseDate}</td>
                        <td>
                          <span className={`artist-admin-status ${statusClasses[track.status]}`}>
                            {track.status}
                          </span>
                        </td>
                        <td>
                          <div className="artist-admin-table-actions">
                            <button
                              type="button"
                              className="artist-admin-icon-button"
                              aria-label={`Edit ${track.title}`}
                              onClick={() => openEditDialog(track)}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              type="button"
                              className="artist-admin-icon-button danger"
                              aria-label={`Delete ${track.title}`}
                              onClick={() => deleteTrack(track.id)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                            <button
                              type="button"
                              className="artist-admin-icon-button"
                              aria-label={`${track.title} more actions`}
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTracks.length === 0 ? (
                  <div className="artist-admin-empty-state">No tracks match the current filters.</div>
                ) : null}
              </div>

              <div className="artist-admin-pagination">
                <span>
                  Showing {filteredTracks.length ? 1 : 0}-{filteredTracks.length} of {tracks.length} tracks
                </span>
                <div>
                  <button type="button" disabled>
                    Previous
                  </button>
                  <button type="button">Next</button>
                </div>
              </div>
            </article>
          </div>

          <aside className="artist-admin-side-panels">
            <article className="artist-admin-panel artist-admin-financial-card">
              <div className="artist-admin-panel-heading compact">
                <h2>Financials</h2>
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>

              <div className="artist-admin-balance-strip">
                <span>Unpaid Balance</span>
                <strong>$42,390.45</strong>
              </div>

              <dl className="artist-admin-details-list">
                <div>
                  <dt>Next Payout</dt>
                  <dd>Feb 28, 2024</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="verified">
                    <span />
                    Verified
                  </dd>
                </div>
              </dl>

              <button type="button" className="artist-admin-primary-button full">
                Manual Payout
              </button>
            </article>

            <article className="artist-admin-panel artist-admin-actions-card">
              <h2>Admin Actions</h2>
              <button type="button">
                <span className="material-symbols-outlined">verified_user</span>
                <span>Verify Identity</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button type="button" className="danger">
                <span className="material-symbols-outlined">block</span>
                <span>Suspend Account</span>
              </button>
              <p>Last active by Alex R.</p>
            </article>
          </aside>
        </section>
      </main>

      {isTrackDialogOpen ? (
        <div className="artist-admin-dialog-backdrop" role="presentation">
          <form className="artist-admin-dialog" onSubmit={handleTrackSave}>
            <div className="artist-admin-dialog-heading">
              <div>
                <h2>{editingTrackId ? 'Edit Track' : 'Add New Track'}</h2>
                <p>Changes are stored in this browser session.</p>
              </div>
              <button type="button" className="artist-admin-icon-button" onClick={closeTrackDialog}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <label>
              <span>Track Title</span>
              <input name="title" value={trackForm.title} onChange={handleFormChange} />
            </label>

            <label>
              <span>Album / Release</span>
              <input name="meta" value={trackForm.meta} onChange={handleFormChange} />
            </label>

            <div className="artist-admin-dialog-grid">
              <label>
                <span>Streams</span>
                <input name="streams" value={trackForm.streams} onChange={handleFormChange} />
              </label>
              <label>
                <span>Release Date</span>
                <input name="releaseDate" value={trackForm.releaseDate} onChange={handleFormChange} />
              </label>
            </div>

            <label>
              <span>Status</span>
              <select name="status" value={trackForm.status} onChange={handleFormChange}>
                <option>Live</option>
                <option>Pending</option>
                <option>Draft</option>
              </select>
            </label>

            <label>
              <span>Cover Image URL</span>
              <input name="image" value={trackForm.image} onChange={handleFormChange} />
            </label>

            <div className="artist-admin-dialog-actions">
              <button type="button" className="artist-admin-muted-button" onClick={closeTrackDialog}>
                Cancel
              </button>
              <button type="submit" className="artist-admin-primary-button">
                Save Track
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default ViewArtistPage
