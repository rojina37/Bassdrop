import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { apiFetch } from '../../../../lib/api'
import { getInitials } from '../../../../lib/format'

const ViewUserPage = () => {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return undefined
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    const timer = setTimeout(() => {
      apiFetch(`/admin/users${query}`, { token })
        .then(({ users: list }) => setUsers(list))
        .catch(() => {})
    }, 250)
    return () => clearTimeout(timer)
  }, [token, search])

  return (
    <>
      <div className="admin-table-toolbar">
        <input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-table-avatar admin-table-avatar-initials">{getInitials(user.name)}</div>
                  </td>
                  <td className="admin-table-title">{user.name}</td>
                  <td className="admin-table-sub">{user.email}</td>
                  <td>
                    <span className={`admin-table-pill ${user.role === 'ADMIN' ? 'admin-table-pill-alt' : ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="admin-table-sub">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="admin-table-empty">No users found.</p>}
        </div>
      </div>
    </>
  )
}

export default ViewUserPage
