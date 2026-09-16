import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../lib/format'

// Avatar showing the user's initials — clicking it opens a small dropdown
// with the account name and a Log Out action. Used in every page's navbar.
const ProfileMenu = ({ avatarClassName = 'profile-avatar', frameClassName, loginPath = '/login' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate(loginPath, { replace: true })
  }

  const avatarButton = (
    <button
      type="button"
      className={`${avatarClassName} avatar-initials`}
      onClick={() => setOpen((current) => !current)}
      aria-label="Account menu"
      aria-haspopup="true"
      aria-expanded={open}
    >
      {getInitials(user?.name)}
    </button>
  )

  return (
    <div className="profile-menu" ref={containerRef}>
      {frameClassName ? <div className={frameClassName}>{avatarButton}</div> : avatarButton}

      {open && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-preview">
            <span className="profile-menu-preview-avatar">{getInitials(user?.name)}</span>
            <div className="profile-menu-preview-info">
              <p className="profile-menu-preview-name">{user?.name}</p>
              <p className="profile-menu-preview-email">{user?.email}</p>
            </div>
          </div>
          <button type="button" className="profile-menu-item" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
