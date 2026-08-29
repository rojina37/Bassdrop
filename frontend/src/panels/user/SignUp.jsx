import React, { useState } from 'react'
import { Link, Navigate} from 'react-router-dom'

const brandImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDLMggrwHf673Icctioo5C_FMFavQhfeRarbQZrCZMKbXOrGmtOpLfGGnrMmszS23KrPsfDIimGSP5bAh7laCd59hXhrzRebuPn-CWMGNWgfZICQ7_pxmgI3zXFyuZYIYroOjthzFy-gHcJh-56YPoBObuNep1_FgmVlwnwxHp1crg3vL4DaZabySrJElg6EHL9p5Xq8z2sqhqhSUhPOi_-14d1_5KUbeaXYwe6rkDfmQSGbXkmICu3S1B8FIP2NNxnlxXvpcs69M'

const googleIcon =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkoKO14kCnXfJLwzvhtn6w2GUeyFHWjP7EDjjs8s9fnKzfT0VkDQqX1QLMsdsXbrT0NoOythbvOTu3SrFVCSeO1MW5dZtLvtCopb9YGCn9Ikyt0F9RbCFOd1jEKyG5z0DNEc_8H0yt4N_gkocNfH2It6tnojaIr7VjQtOv9avRzW6MFvONUrse_l4pCtj4zmcywSP7L6cA7v_JhoehNrh8MwhJbI0Ugjwk0YlafK-1lT51uB4oR8qRnrnUnY8gmheW3pNwO36e-6w'

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

const identityModes = [
  { id: 'listener', icon: 'headphones', label: 'Listener' },
]

const Signup = () => {
  const navigate = useNavigate();
  const [identityMode, setIdentityMode] = useState('listener')

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

        <footer className="signup-brand-meta">
          <span>Obsidian V.1</span>
          <span>Editorial Audio</span>
          <span>System 2024</span>
        </footer>
      </section>

      <section className="signup-form-panel" aria-label="Create account">
        <div className="signup-form-card">
          <div className="signup-heading">
            <h2>Create Account</h2>
            <p>Join the next evolution of digital curation.</p>
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
              <label className="signup-field">
                <span>Full Name</span>
                <span className="signup-input-wrap">
                  <span className="material-symbols-outlined">person</span>
                  <input id="name" name="name" type="text" placeholder="Elias Thorne" />
                </span>
              </label>

              <label className="signup-field">
                <span>Email Address</span>
                <span className="signup-input-wrap">
                  <span className="material-symbols-outlined">alternate_email</span>
                  <input id="signup-email" name="email" type="email" placeholder="elias@obsidian.sonic" />
                </span>
              </label>

              <label className="signup-field">
                <span>Secure Password</span>
                <span className="signup-input-wrap">
                  <span className="material-symbols-outlined">lock</span>
                  <input id="signup-password" name="password" type="password" placeholder="************" />
                </span>
              </label>
            </div>

            <label className="signup-terms">
              <input id="terms" name="terms" type="checkbox" />
              <span>
                I accept the <strong>BaseDrop Immersion Agreement</strong>
              </span>
            </label>

            <button type="submit" className="signup-submit-button">
              <span>Get Started</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="signup-alternate">
            <div className="signup-divider">
              <span>Or Continue With</span>
            </div>

            <div className="signup-social-row">
              <button type="button" aria-label="Continue with Google">
                <img src={googleIcon} alt="" />
              </button>
              <button type="button" aria-label="Continue with Apple">
                <span className="material-symbols-outlined">ios</span>
              </button>
            </div>

            <p>
              Already part of the network?
              <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Signup
