import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import ProfileMenu from '../../../components/ProfileMenu'

const adminNavItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'queue_music', label: 'Songs', href: '/admin/view/song' },
  { icon: 'mic', label: 'Artists', href: '/admin/view/artist' },
  { icon: 'sell', label: 'Genres', href: '/admin/add/genre' },
  { icon: 'group', label: 'Users', href: '/admin/view/user' },
]

const pageTitles = {
  '/admin': 'Platform Overview',
  '/admin/view/song': 'Songs',
  '/admin/view/artist': 'Artists',
  '/admin/add/genre': 'Genres',
  '/admin/view/user': 'Users',
}

export const AdminShell = () => {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Admin'

  return (
    <div className="admin-page-shell">
      <aside className="sidebar admin-sidebar">
        <div className="brand-block admin-brand-block">
          <img src="/public/images/BD.png" alt="BassDrop logo" className="h-30 w-30 object-full" />
        </div>

        <nav className="sidebar-nav">
          {adminNavItems.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link key={item.label} to={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                <span className={`material-symbols-outlined ${active ? 'admin-nav-icon-active' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <header className="topbar admin-topbar">
        <div className="topbar-left">
          <span className="mobile-brand">Sonic</span>
          <h2>{title}</h2>
        </div>

        <div className="topbar-actions">
          <ProfileMenu loginPath="/admin/login" />
        </div>
      </header>

      <main className="content admin-content">
        <div className="admin-canvas">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-nav admin-mobile-nav">
        {adminNavItems.map((item) => {
          const active = location.pathname === item.href
          return (
            <Link key={item.label} to={item.href} className={active ? 'active' : ''}>
              <span className={`material-symbols-outlined ${active ? 'filled' : ''}`}>{item.icon}</span>
              <span>{item.label.replace('View ', '').replace('Add ', '')}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default AdminShell
