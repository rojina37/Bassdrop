import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { apiFetch } from '../../../lib/api'
import AdminQuickActions from '../layout/AdminQuickActions'

const genreTones = ['primary', 'tertiary', 'secondary', 'muted']

const Admin = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [genres, setGenres] = useState([])

  useEffect(() => {
    if (!token) return
    apiFetch('/admin/stats', { token })
      .then(({ stats: s }) => setStats(s))
      .catch(() => {})
    apiFetch('/genres')
      .then(({ genres: list }) => setGenres(list))
      .catch(() => {})
  }, [token])

  const statCards = stats
    ? [
        { icon: 'group', label: 'Total Users', value: stats.userCount, tone: 'primary' },
        { icon: 'graphic_eq', label: 'Total Songs', value: stats.songCount, tone: 'tertiary' },
        { icon: 'person_add', label: 'Total Artists', value: stats.artistCount, tone: 'secondary' },
        { icon: 'forum', label: 'Group Chats', value: stats.chatCount, tone: 'success' },
      ]
    : []

  const totalGenreSongs = genres.reduce((sum, genre) => sum + genre.songCount, 0)
  const topGenres = genres
    .filter((genre) => genre.songCount > 0)
    .sort((a, b) => b.songCount - a.songCount)
    .slice(0, 4)
    .map((genre, index) => ({
      name: genre.name,
      value: totalGenreSongs > 0 ? Math.round((genre.songCount / totalGenreSongs) * 100) : 0,
      tone: genreTones[index % genreTones.length],
    }))

  return (
    <>
      <AdminQuickActions />

      <section className="admin-stats-grid" aria-label="Realtime statistics">
        {statCards.map((stat) => (
          <article key={stat.label} className="admin-stat-card inner-glow">
            <div className="admin-card-topline">
              <span className={`material-symbols-outlined admin-tone-${stat.tone}`}>{stat.icon}</span>
            </div>
            <div>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </article>
        ))}
      </section>

      {topGenres.length > 0 && (
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
      )}
    </>
  )
}

export default Admin
