import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Home from '../panels/user/Home'

// The index route ('/') isn't behind ProtectedRoute — it shows Home when
// logged in, and sends logged-out visitors straight to Login (no landing page).
// An authenticated admin is bounced to /admin instead — admin is a separate,
// self-contained experience (see ProtectedRoute), not just another Home visitor.
const HomeOrLanding = () => {
  const { isAuthenticated, user, initializing } = useAuth()

  if (initializing) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />
  return <Home />
}

export default HomeOrLanding
