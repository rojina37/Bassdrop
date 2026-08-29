import React from 'react'
import { Link } from 'react-router-dom'

const backgroundImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnoWq3MmMQKocVHS4Q-6SBeUglaRT2omu7hBaTWtp102oCr1Hcc2GfputgzvjQPUlyZ8UBF-bhL15gMALPlD8JRbI7xbQjmfF1GBs7hfikGWHnx7xfCKUL3g9AY3y01FxpH-hE_FlJe9396VHJSTZUVU3ZeK_V2rV4OxcE7gmFzgJ86Nnn6eCaSot4erf-z0AUvno9t98U9XNkHAI83EfSvZohZrTCq-CgqP-mmQa6apf8KuDy90G111-IxP3ii7bucRPOPnffObY'

const Login = () => {
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
            <h2>Welcome back</h2>
            <p>Enter your credentials to access your library</p>
          </div>

          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <label className="login-field">
              <span>Email Address</span>
              <span className="login-input-wrap">
                <span className="material-symbols-outlined">alternate_email</span>
                <input id="email" name="email" type="email" placeholder="name@example.com" />
              </span>
            </label>

            <label className="login-field">
              <span className="login-password-label">
                <span>Password</span>
                <a href="#">Forgot password?</a>
              </span>
              <span className="login-input-wrap">
                <span className="material-symbols-outlined">lock</span>
                <input id="password" name="password" type="password" placeholder="********" />
              </span>
            </label>

            <button type="submit" className="login-submit-button">
              Sign In
            </button>

            <div className="login-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <Link to="/login" className="login-user-button">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Login as User</span>
            </Link>
          </form>
        </div>

        <footer className="login-footer">
          <p>
            Don&apos;t have an account?
            <Link to="/signup">Create an Account</Link>
          </p>
          <nav aria-label="Login footer">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Help</a>
          </nav>
        </footer>
      </section>

      <div className="login-top-glow" aria-hidden="true" />
    </main>
  )
}

export default Login
