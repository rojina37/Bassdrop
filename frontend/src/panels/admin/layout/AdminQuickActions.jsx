import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const quickActions = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'queue_music', label: 'Songs', href: '/admin/view/song' },
  { icon: 'mic', label: 'Artists', href: '/admin/view/artist' },
  { icon: 'sell', label: 'Genres', href: '/admin/add/genre' },
  { icon: 'group', label: 'Users', href: '/admin/view/user' },
]

const AdminQuickActions = () => {
  const location = useLocation()

  return (
    <section className="admin-panel admin-actions-panel admin-quick-actions" aria-label="Content management">
      <h3>Manage Content</h3>
      <div className="admin-action-grid">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={`admin-action-tile ${location.pathname === action.href ? 'active' : ''}`}
            aria-current={location.pathname === action.href ? 'page' : undefined}
          >
            <span className="material-symbols-outlined">{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default AdminQuickActions
