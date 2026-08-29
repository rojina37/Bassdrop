import React from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search', active: true },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library' },
  
]

const topResults = [
  {
    title: 'Midnight Geometry',
    meta: 'Echo Pulse - Album',
    duration: '3:45',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCD-lf3K5uZkt7rYi83Hh_wKDwIISUrfztyAfct-f5qWc8Sm3NpjeAyI8wbI4LivYnAjN4jndcJ0Rud9yiHqxQZ3QxH6wa7RwCMlXPePFWqqVwWbwrzwpgxtrvR-i--yw_6fZZrE05zsuhSnxEOR51P6ovBzJ3JYgMi_YJ2oLBgMi50UaL2Xbr5B1ZxdsYvfdky1q9HF4juP6a5mRY3K_lts9HDIaiRqqsglwYUMXMCfmJ2Cz4vPIyHQk1beICS2cxS6m1Yrjw6oi0',
  },
  {
    title: 'Concrete Wilderness',
    meta: 'Echo Pulse - Single',
    duration: '4:12',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAHCfiXYFITmEfFAGSx1eU8T5t6IiBd15XUqnKAxC8N4wNWivUUviHnyya-cPov516m5QdeEnJwkbyM5WsmxJdgcte8c5s2V7gYtfd8LoHTSX7BJ4Ei6zQWI90sJqqUYP084xl0RQwNHg4d_BWneSfeKd9UoK5MluUJQozdWVmK3ZR_vFm67UT7QUEDN98syZRtr_IzS2rboRSnLYL2lJMMMxI9CvxXC2-dxm0rugfupkvl1BL7ZBK6B2B-MLk1qhjQiGXzWuC5lXQ',
  },
  {
    title: 'Vapor Dreams',
    meta: 'Echo Pulse - Album',
    duration: '5:21',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDR0NbZ6PiEss9j-NcbIqFtOWbGKR8lxam3T28F4Xv7j8dM77f-Bm9gvI0o1rMOTaEO-ZTNN7BUM8gwITkxymcgpw9LUcfOFGh8P4GlU0C5oKV2HGpwiZiJMMy35sLfdWGhqjmJrs5_fNTjzSkTa9S64iSfMNl6PPg8ffMlDPvm8HeI0qb_jDKw4c3Hwkk6SgAX0KYP1J3FafDqYVhKORqX4C0OHrxbgGAELmiVHLzgFxOpH1MhwfnOqtLkfDRzO_psjMBGAIxcwwQ',
  },
  {
    title: 'Obsidian Roots',
    meta: 'Echo Pulse - EP',
    duration: '2:58',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZsZoYbKfwBGfy0bmjWN_G8682kDweXRLJ91Cp36cXNArnc5eOwFM-5Hk0_svHdFVlpQEy4cS9KQxe3rmKZh6Sul2h2g3H99qHxV9Hm9ZRxHUHQ37Co692LEVH_ARLWAxTjfrsbi16bn37u-QDj_GiMjT4r2lFjzJnUtbNYNSjRrUyw-q_YS9BqSD4GF9gOgvZahwr1TQhx7Px0rmn46-MDDW8SLK2L0PzDfCzgvG8UmPtwUWL0c5__S3PRCffQ1z2eiYdw5YUJAc',
  },
]

const genres = [
  {
    title: 'Pop',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEpwP0rEBrhZK47OclbzEZUEmXHZZG-FsxBfhe9PEtO0KZTXvdILPs4TVwCyLyC8Ue2uRRBwZDP8gALKLn0tJfZaeAn53unU7qjVdz0Zj4WF-K8Wks1qZX2oLsiUrmbN2nkbwVrBzgbJzjYjUtgoXLxL8MjaPDnTqvzA0lx-cnLSr5X-GVZFLw67j0QjjTUGSO6z0xF3LfXEJyYMGx3XJfD2S2sJT4zcxCKswKLiRRBQ_oSN2-iWsdPx9maIFp1qz0vxmnRbBTVz4',
    gradientClass: 'genre-pop',
  },
  {
    title: 'Rock',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJI407L75lqhf7FwqQgW4v99DiK2e4mlN9jIWm8BzmVZkt4zEk7dTj5DzeYF3BTCE0jKMzVmQQV45bR8VHbatMqQ41Irb46EyKo5e6ZGxz7WsAyjGO2oeltk3YlGcpIdHg1qNLImfJEAN1B6a2jqj-7Ho1hCdpOxaiHJn8zwkwCUN8jy8Vfncy7zSvLq8IiXbwZd-rbBk4Ub2RsQ18grrEDhGQdkXAbw0VE7vwuX95n1K3JBZz3dzabeMmCfbayimDvpj0W-Pqh2c',
    gradientClass: 'genre-rock',
  },
  {
    title: 'Focus',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjVnqXFgtf5Sz3kib6CwSc9sKUF95MFyl3wulvBaSFAZjBDtQuy_10m-gVxZD2m_tTnH0VwWc2_OatFqUo81d-MioP93Fo8hGLNBdn424D6eF11ea2tHx21O4JmEtObWMVSOnMihStFLz8CipFkbnowec4thpN8xq0KvRIf84ZdyIiL2c6Lh_MOztGqSfzH31cC5qOW3JTri4mvho5lui4uTSgM0sEIP_WpzYgwe1exxv6NdJWtQ8dF7SFAjY6YcCZLHXaCbCDeJY',
    gradientClass: 'genre-focus',
  },
  {
    title: 'Jazz',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCR-I7suCrcc1sqLFeZJxBPNGlksJ4w5CJP6sbvMAzTxXuZZCHxh6JdkqU8ndDsUphz623IxtwOwIxz5XIWoLGy0JF0UF87W4pCfmg4OpY-LbRKd--0_ei4lvFPmZhvlEAOrG-lCz7t0N-LuehVqspt92OKOaDKGZKf_IykRb1D94B5jAGqbeWbnPBmD77ltOPHv_98yeanXu43tTt2D6K0UIlkWl00tE9f3HCTjpaywJNldQtTbWc2dNNZFhRd4lr1-hFg6SCwe9s',
    gradientClass: 'genre-jazz',
  },
  {
    title: 'Hip Hop',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJCzPL7KTwviC6k05O6RKVAXTuGVmJCGN4BXXYE6cRAY3rZu8C6LuoGVAqQbtRtLo1upqgGHlhWp9pJPwLGtEjRvXmP4oPrttHz_-fpY0L8u8ln_pLVxCjpUt8kyoKMDvVlL45mRw9rzTX2sOCOR3wlUffbuHk5-9VzAxf_zkOngskDbmktBwELLPM8-jqMK9cE4d8Eb4qS6_NaAapHAPniqWRCV2E2diiZ3ivZiH1ZWMCZRi7xip2nKsDpw9NkyDgrSQbWwDTtjQ',
    gradientClass: 'genre-hip-hop',
  },
]

const Search = () => {
  return (
    <div className="BassDrop-app search-page-shell">
      <nav className="topbar search-topbar">
        <div className="topbar-left">
          <span className="search-topbar-brand">BaseDrop</span>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <div className="search-profile-frame">
            <img
              className="profile-avatar search-profile-avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFNiMoItOQP5d9ezcYBe_ezYIbwr5fDVX3B2deBCLJQx_no-wiqoJdFysobEXyfpsT5ukTUOXSwtuuj4J2SMOjynlDwSU6dfx5Zk29jpYh0K5CEmz3ITSqUc3CNBIbz5eAKihy94BA9aObQEnh3KCkd867GXGU1xQ_FhtrHZefOzVGJrYWBt7pqPbithZ6S2Ps4oKR0ip-hzCTVIujU16lMpXK095k68laTjQ25On0CJWGatVSNTCkmn5Xv3yrzeDmCmK4z33v5Mw"
              alt="User profile"
            />
          </div>
        </div>
      </nav>

      <aside className="sidebar search-sidebar">
        <div className="search-sidebar-brand">
         <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full rounded-full'/>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`nav-link ${item.active ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="content search-main">
        <div className="search-canvas">
          <header className="search-header">
            <div className="search-field">
              <span className="material-symbols-outlined search-field-icon">search</span>
              <input type="text" placeholder="What do you want to listen to?" />
            </div>
          </header>

          <section className="search-block">
            <h2 className="search-block-title">Top Results</h2>
            <div className="top-results-grid">
              <article className="featured-artist-card inner-glow">
                <div className="featured-artist-content">
                  <div className="featured-artist-avatar">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcJoYTNyHlO7JrP_m69WDsmi6gPo2zmq6HeHEZ-zxNcjn4fij1_3L85k9cfeuO8B-ZpRYsfpRVO5KJ3Coi2tdE3wK1Gwhla4BF7FBse8SpYb-jgYD-686oW22EhBj7R-p8repKFGBZyJpIn0zSwgJvkf4UBSkrhwEMNGZuu3tsAfg9u9qDY-ZTL7hKb-kEo5FKhv--pk1dUfEAi017tpDn9th3SSi1w0ZZ_w7jgfyf-0RYZk5hJEsYm5jRr_uN_ghYnV_e-uLi5io"
                      alt="Featured Artist"
                    />
                  </div>
                  <h3>Echo Pulse</h3>
                  <div className="featured-artist-meta">
                    <span>Artist</span>
                    <p>12.4M Monthly Listeners</p>
                  </div>
                </div>
                <button type="button" className="featured-play-button" aria-label="Play artist">
                  <span className="material-symbols-outlined filled">play_arrow</span>
                </button>
              </article>

              <div className="top-results-list">
                {topResults.map((item) => (
                  <article key={item.title} className="top-result-row">
                    <img src={item.image} alt={item.title} />
                    <div className="top-result-copy">
                      <p className="top-result-title">{item.title}</p>
                      <p className="top-result-meta">{item.meta}</p>
                    </div>
                    <span className="top-result-duration">{item.duration}</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="search-block">
            <div className="section-header search-section-header">
              <h3>Browse All</h3>
              <a href="#">See all</a>
            </div>

            <div className="browse-grid">
              {genres.map((genre) => (
                <article key={genre.title} className={`browse-card ${genre.gradientClass}`}>
                  <div className="browse-card-gradient" />
                  <img src={genre.image} alt={`${genre.title} Genre`} />
                  <span>{genre.title}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="player-bar search-player-bar">
        <div className="player-now-playing">
          <div className="now-art">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoTs896SVXdI3Nz_tmaoptgSvNOIom8GId2-TggaIjvlIOAyxGSS6z4W8qqdHb38RYXsnpTmO9DqvDjR-54m5oOknYqeSWUGUIqBOLGvnWi2ZmqFPXyGu0S-srjD4tR85eer6zFsnpaHwTiFnH-Wq8kLnPQQCyegQgAtllWZIFTsXC3mb0k_GGQvimjysyhcrjRPjo43Sca3xyH_OPCLNcGY_zr3YJIzA_sPsuzHdF0ICbU4PNXuy0eHKX8h0FOG7WI6M2AhiwjSc"
              alt="Now Playing Art"
            />
          </div>
          <div className="now-meta">
            <h4>Midnight Geometry</h4>
            <p>Echo Pulse</p>
          </div>
          <button type="button" className="icon-button" aria-label="Favorite">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>

        <div className="player-controls">
          <div className="control-row">
            <button type="button" className="icon-button light" aria-label="Shuffle">
              <span className="material-symbols-outlined">shuffle</span>
            </button>
            <button type="button" className="icon-button light" aria-label="Previous">
              <span className="material-symbols-outlined filled">skip_previous</span>
            </button>
            <button type="button" className="play-main" aria-label="Play">
              <span className="material-symbols-outlined filled">play_circle</span>
            </button>
            <button type="button" className="icon-button light" aria-label="Next">
              <span className="material-symbols-outlined filled">skip_next</span>
            </button>
            <button type="button" className="icon-button light" aria-label="Repeat">
              <span className="material-symbols-outlined">repeat</span>
            </button>
          </div>

          <div className="progress-row search-progress-row">
            <span>1:24</span>
            <div className="progress-bar search-progress-bar">
              <div className="progress-current search-progress-current" />
              <div className="progress-thumb" />
            </div>
            <span>3:45</span>
          </div>
        </div>

        <div className="player-extra">
          <button type="button" className="icon-button light" aria-label="Lyrics">
            <span className="material-symbols-outlined">lyrics</span>
          </button>
          <button type="button" className="icon-button light" aria-label="Queue">
            <span className="material-symbols-outlined">queue_music</span>
          </button>
          <div className="volume-shell">
            <span className="material-symbols-outlined">volume_up</span>
            <div className="volume-bar">
              <div className="volume-current search-volume-current" />
            </div>
          </div>
          <button type="button" className="icon-button light" aria-label="Fullscreen">
            <span className="material-symbols-outlined">open_in_full</span>
          </button>
        </div>
      </footer>

      <nav className="mobile-nav search-mobile-nav">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.label} to={item.href} className={item.active ? 'active' : ''}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label.replace('Your ', '')}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Search
