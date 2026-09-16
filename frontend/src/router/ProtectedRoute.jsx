import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ requireAdmin = false }) {
  const { isAuthenticated, user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return null

  if (!isAuthenticated) {
    return (
      <Navigate to={requireAdmin ? '/admin/login' : '/login'} replace state={{ from: location }} />
    )
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  // The reverse case: an authenticated admin landing on a consumer-only route
  // (back button, a stale link, a typed-in URL) gets sent back to /admin
  // instead of seeing the regular user app — admin is meant to be a fully
  // separate, self-contained experience (see AdminShell / PROJECT.md).
  if (!requireAdmin && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, user, initializing } = useAuth()

  if (initializing) return null

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/'} replace />
  }

  return <Outlet />
}
