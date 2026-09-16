import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'bassdrop.auth'
const AuthContext = createContext(null)

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Persisted to localStorage so a page refresh doesn't log you out — only an
// explicit Log Out clears the session.
export function AuthProvider({ children }) {
  const [stored] = useState(readStoredAuth)
  const [token, setToken] = useState(stored?.token ?? null)
  const [user, setUser] = useState(stored?.user ?? null)
  const [initializing, setInitializing] = useState(Boolean(stored?.token))

  // On load, re-validate a stored token against the API instead of trusting it blindly.
  useEffect(() => {
    if (!stored?.token) return
    let cancelled = false

    apiFetch('/auth/me', { token: stored.token })
      .then(({ user: freshUser }) => {
        if (cancelled) return
        setUser(freshUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: stored.token, user: freshUser }))
      })
      .catch(() => {
        if (cancelled) return
        setToken(null)
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [stored])

  const persist = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  const login = async (email, password) => {
    const { token: newToken, user: newUser } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    persist(newToken, newUser)
    return newUser
  }

  // Deliberately does NOT auto-sign-in: creating a fresh account should land
  // on the login screen, not skip straight into the app.
  const register = async (name, email, password) => {
    const { user: newUser } = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    return newUser
  }

  // Deliberately does NOT auto-sign-in: creating a fresh admin account should
  // land on the admin login screen, not skip straight into the dashboard.
  const registerAdmin = async (name, email, password) => {
    const { user: newUser } = await apiFetch('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    return newUser
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({ token, user, initializing, isAuthenticated: Boolean(token), login, register, registerAdmin, logout }),
    [token, user, initializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
