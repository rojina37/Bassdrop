import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const backgroundImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnoWq3MmMQKocVHS4Q-6SBeUglaRT2omu7hBaTWtp102oCr1Hcc2GfputgzvjQPUlyZ8UBF-bhL15gMALPlD8JRbI7xbQjmfF1GBs7hfikGWHnx7xfCKUL3g9AY3y01FxpH-hE_FlJe9396VHJSTZUVU3ZeK_V2rV4OxcE7gmFzgJ86Nnn6eCaSot4erf-z0AUvno9t98U9XNkHAI83EfSvZohZrTCq-CgqP-mmQa6apf8KuDy90G111-IxP3ii7bucRPOPnffObY'

const Login = () => {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const userIsAdmin = user.role === 'ADMIN'

      // The account is valid, but this is the wrong portal for its role —
      // don't leave it signed in and don't navigate anywhere.
      if (userIsAdmin !== isAdmin) {
        logout()
        setError(
          isAdmin
            ? "This account isn't an admin. Log in from the user page instead."
            : 'This is an admin account. Log in from the admin page instead.',
        )
        return
      }

      const fallback = userIsAdmin ? '/admin' : '/'
      navigate(location.state?.from?.pathname ?? fallback, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page-shell">
      <div className="login-background" aria-hidden="true">
        <span className="login-light-streak login-streak-one" />
        <span className="login-light-streak login-streak-two" />
        <span className="login-light-streak login-streak-three" />
        <img src={backgroundImage} alt="" />
      </div>

      <section className="login-card-shell" aria-label="Sign in">
        <div className="login-brand">
          <div className="login-brand-mark">
            <span className="material-symbols-outlined">graphic_eq</span>
          </div>
          <h1>BassDrop</h1>
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <h2>{isAdmin ? 'Admin sign in' : 'Welcome back'}</h2>
            <p>
              {isAdmin ? 'Enter your admin credentials to manage the catalog' : 'Enter your credentials to access your library'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <label className="login-field">
              <span>Email Address</span>
              <span className="login-input-wrap">
                <span className="material-symbols-outlined">alternate_email</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
            </label>

            <label className="login-field">
              <span>Password</span>
              <span className="login-input-wrap">
                <span className="material-symbols-outlined">lock</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  className="password-field"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined toggle-icon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </span>
            </label>

            {error && <p className="login-error-message">{error}</p>}

            <button type="submit" className="login-submit-button" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <footer className="login-footer">
          <p>
            Don&apos;t have an account?
            <Link to={isAdmin ? '/admin/signup' : '/signup'}>Create an Account</Link>
          </p>
        </footer>
      </section>

      <div className="login-top-glow" aria-hidden="true" />
    </main>
  )
}

export default Login
