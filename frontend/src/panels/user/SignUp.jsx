import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const brandImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDLMggrwHf673Icctioo5C_FMFavQhfeRarbQZrCZMKbXOrGmtOpLfGGnrMmszS23KrPsfDIimGSP5bAh7laCd59hXhrzRebuPn-CWMGNWgfZICQ7_pxmgI3zXFyuZYIYroOjthzFy-gHcJh-56YPoBObuNep1_FgmVlwnwxHp1crg3vL4DaZabySrJElg6EHL9p5Xq8z2sqhqhSUhPOi_-14d1_5KUbeaXYwe6rkDfmQSGbXkmICu3S1B8FIP2NNxnlxXvpcs69M'

const featureHighlights = [
  {
    icon: 'graphic_eq',
    title: 'Music Lounge',
    description: 'Experience soundscapes designed to adapt to your physical environment.',
  },
  {
    icon: 'library_music',
    title: 'Music Vault',
    description: 'A private library encrypted and tailored to your sonic identity.',
  },

]

const listenerModes = [{ id: 'listener', icon: 'headphones', label: 'Listener' }]
const adminModes = [{ id: 'admin', icon: 'admin_panel_settings', label: 'Admin' }]

const Signup = () => {
  const { register, registerAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const identityModes = isAdmin ? adminModes : listenerModes
  const [identityMode, setIdentityMode] = useState(identityModes[0].id)
  const [name, setName] = useState('')
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
      if (isAdmin) {
        const derivedName = email.split('@')[0] || 'Admin'
        await registerAdmin(derivedName, email, password)
        navigate('/admin/login', { replace: true })
      } else {
        await register(name, email, password)
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="signup-page-shell">
      <section className="signup-brand-panel" aria-label="Sonic introduction">
        <div className="signup-brand-background">
          <img src={brandImage} alt="" />
          <div className="signup-brand-overlay" />
        </div>

        <header className="signup-wordmark">
          <span>BassDrop</span>
        </header>

        <div className="signup-brand-copy">
          <h1>
            Curate Your <span>Soundscape</span>
          </h1>

          <div className="signup-feature-list">
            {featureHighlights.map((feature) => (
              <article key={feature.title} className="signup-feature">
                <div>
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="signup-form-panel" aria-label="Create account">
        <div className="signup-form-card">
          <div className="signup-heading">
            <h2>{isAdmin ? 'Create Admin Account' : 'Create Account'}</h2>
            <p>
              {isAdmin
                ? 'Set up an admin account to manage the catalog.'
                : 'Join the next evolution of digital curation.'}
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-field-group">
              <span className="signup-group-label">Identity Mode</span>
              <div className="signup-mode-grid">
                {identityModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`signup-mode-button ${identityMode === mode.id ? 'active' : ''}`}
                    onClick={() => setIdentityMode(mode.id)}
                  >
                    <span className="material-symbols-outlined">{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="signup-input-list">
              {!isAdmin && (
                <label className="signup-field">
                  <span>Full Name</span>
                  <span className="signup-input-wrap">
                    <span className="material-symbols-outlined">person</span>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Elias Thorne"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </span>
                </label>
              )}

              <label className="signup-field">
                <span>Email Address</span>
                <span className="signup-input-wrap">
                  <span className="material-symbols-outlined">alternate_email</span>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="elias@obsidian.sonic"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </span>
              </label>

              <label className="signup-field">
                <span>Secure Password</span>
                <span className="signup-input-wrap">
                  <span className="material-symbols-outlined">lock</span>
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="password-field"
                    placeholder="************"
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
            </div>

            {error && <p className="signup-error-message">{error}</p>}

            <button type="submit" className="signup-submit-button" disabled={submitting}>
              <span>{submitting ? 'Creating account…' : 'Get Started'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="signup-alternate">
            <p>
              Already part of the network?
              <Link to={isAdmin ? '/admin/login' : '/login'}>Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Signup
