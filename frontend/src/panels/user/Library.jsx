import React from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: '/search' },
  { icon: 'forum', label: 'Chat', href: '/chat' },
  { icon: 'library_music', label: 'Your Library', href: '/library', active: true },
  
]

const popularTracks = [
  {
    rank: '1',
    title: 'Neon Pulse',
    plays: '42,503,112 plays',
    duration: '3:42',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCejTZRRr6xH7LnvpVta8lv9tz3YGg8sDSgCti0xchkFm0B_h1Nxd81VdXpHz6CcHj9nuI64YnaBzQjIVG7nBspYeKWCs7-slxzGrjOrk3JgxzBQYJaVD58_CCoKkz3wJnT-UrkQU_4e9TBm373XkTtm9UkXEr52EuxdsJbEA5bPav8Gimb8Hj8hFO6NNR084_WR04KRscyTF7wDYZ-qS2bqhlSaWA9S8eztgGO97Vr462jOSJM3UwOJSlQr8_orh9rd4N0YO5SyYk',
  },
  {
    rank: '2',
    title: 'Liquid Glass',
    plays: '38,192,001 plays',
    duration: '4:15',
    active: true,
    liked: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAb9JErym4BYA1oMoDvqcpnadfsQMtGzI-wlJaiLNXBc5Yj5sjYU1S7O-2fY4ynFLnoI56_lRQurc96Ar8L_JMulAlwldV-v81mdnhCKtSGGwojILm74YRnsfOMEn76mXEIWjN4SYONYsKTuTUiajZiVEmTSCNwdFL-urdr9-5B1-srYFGJOfMAIzuJ8E-VPH2bTOS8a1CeQddd4-NY26ZAytygwrTmRy6ZRz8-FXAd0FK_hTY67itWFXPbzBsORb_MJDBedVGF_eE',
  },
  {
    rank: '3',
    title: 'Digital Ghost',
    plays: '29,942,883 plays',
    duration: '2:58',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEK40afi6sUcDW1J-wd8RSSDuglebQ0GgP33Xr6qO3b3OJVxO4kf9jASPAhJ8sIG8AD16qj3DdwtSJoRgpgThpyZZJdhsHOAQVmepMJybTaEQ7xAfnBB_Ko3TmhKaf_70oaShLoTAJ05s_-yQsypxn1y9XriVvamo9PEWWvZ52vXRbvsv33SdldS0frXtqPH_U252_orNdDVoFydGiUsKD58cIzLH192q8ENA5m2LQLgb6fzZ-Rv6i9U4uSYBN8D9Ajs3hoCgpYiE',
  },
]

const discography = [
  {
    title: 'Synthetic Vision',
    meta: '2024 • Album',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC1zVu_GaEwJryIE_JuAxEe2eIowYXKIkNPkaAoz579Y8N9dny-2_eQUdCoM4oObY4T7vImPno7vMkK44MbiQ0GSgOwfgZLBS7HRu1H4EpenQ44BIwFszSJHdslShe1VEFmDkJRHSmUESwHVyBcwJKfGSseBcRCMB8gKEhhMahUbYnKuoJenRXByiUY5fsHBtvC7vsOHm6o20uln6jhSGKuJKAph6flQpaaZPoXhXGjsczo_DadESABDsOemoY7YcF_E_VKor7RttA',
  },
  {
    title: 'The Wire',
    meta: '2023 • EP',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzEBmTE_lDC5Bz-_GNNU68BAgzshTFVn7oNPizkAfp7fvo_vHX6aD4q-7PkzEdRiizlH3PmEQzuDajxUvNNZw7675xJtU2vCm3obo0KzuV12Y5cBwqGKcx7AenufVuxAWZ2TjubQxehhU2hoM8vxbIcn7XoLg8MfcDIkNUZIfXyEWXsJq4Wdfke7EEQ2CDJkib92sizuUD9gpEJOqsojxvIq9FKsCf8S0cLBOy9R67IMdUeV4Agpl7-c7CEqFQiB2CL7_8sUpRmK0',
  },
  {
    title: 'Vapor Lock',
    meta: '2022 • Album',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkJD_8AL8FFsAw9Td5QdWdYzY30I-XiiM-oMd1MIFvRsHQZPy2E3WrLq86t_r0jW39qeJeB7H9nJTWRdS3SLVq3Ln88X8jBb7FKpmU_tkWfCNwvitpZ0gJHsmg_3P3yWtPsSiGWeDVzm8O8Wk2hJ20jbddoqymo3TnkSDM_blB7s4-6DK5fU-GkFZN4p1QHV9fCT9HwwVGvNtrbkCuUFzE75sYRiPahvoovUEsb2Yl9d9K06wTWgym9yCKFR1RswSKlwePXP615o',
  },
  {
    title: 'Null Vector',
    meta: '2021 • Single',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB8T8A5A8Rz8e-p3CfwMDPilRndR93nDmbwo2ZliP2Y5jLxD1g0dsry35qPcK-iMHzawgJpI85gQYjX7VBeOMnjV5wAsOk8IRCsSaOlmGRgoVi7JIYCoVpWmkTwedEzvzUS0tyxUeby3bsVpAX2VlCGc1Nx-qZlS38JBNbwHP825W6_3ZS4v6NcqTmBlIOflJ1ljyzN1942f3PBi4G0g35v39svKUdF0wHff66CLGgU6Y-XgWmMcz4cnGn8BAbst_2fSdSaZr_GCm4',
  },
]

const relatedArtists = [
  {
    name: 'Echo Synth',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2iK-e9xV1GzHyzi71_EvFPBmXNZg2v-ZLHfVx4jieVdN09GlHM5jfEBEuwNuZzh2iMeV6ygGniAGnV00eB9uK5e7FE1_ZOTWADi7KzuO2JMQo1Pscm1ptjyNs7iqRNmsmwCuZXoqNJTqFpEFCb22p9ddhnRG0dKLRM6IKLzL7Wf6g8wi--AmJ0ZoSF9lkGs_vnRi28JATqhdFh2gOEp4E8iYntqDTGZzWDq0VoUZBSWN7LVdDGFpIXbe4tj3tqLHedueugQw6PLI',
  },
  {
    name: 'Static Void',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9mNez7D4zlY_dtZYdsvDH5ZWegesi0Mrdwhu0TdyrNsMJZNCm5guw-uqKp-IfcxKOxfxZ406_KcMTGp9tX0bs_Td6vmuzuSW_qTDwBKR9Q9Zn53yI8OdAMx5GZt62RVLhYCZ6doabHPjZujvNYuSsYzY_89ESJw8gxjyl0PeBKWv1RYk1YLfERKfvKnEZ6DAO9iXr_N9vV9zmsRJmKBkZCmQ7AFH-Xr1rpQAsW10vXWE6b6XYZzDSsHGHBSIuYpQmcKQU5owbjTs',
  },
  {
    name: 'Circuit Breaker',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_u1DIWiP8pGm10zM4X_T_e0uw-TVHgeT_65KYKYYfDYSe1AxPQW53AoAwkEkwT-Y9x54eABvZKs8asqLA7uJNuMXuHKVpKi3VRuBq4vu8dffmHRa21N49EnRqytVNW8314ifdtB6MrsNhBwE_F8jdsi5LzLsPhcFtylvNa7VzY-oCpNs77tffgajajcmP1QI-LIsgyGeWD1Ql7TBLJRvnBG3CWV8uYdDk-_JNhKmtUNhnQ46yzZjCoDtwYDJ-Heo0pioxwXJ-mYQ',
  },
]

const Library = () => {
  return (
    <div className="library-page-shell">
      <aside className="sidebar library-sidebar">
        <div className="brand-block library-brand-block">
          <img src='/public/images/BD.png' alt='BassDrop logo' className='h-30 w-30 object-full rounded-full'/>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`nav-link ${item.active ? 'active' : ''}`}
            >
              <span className={`material-symbols-outlined ${item.active ? 'library-nav-icon-active' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="topbar library-topbar">
        <div className="topbar-left">
          <span className="mobile-brand">BassDrop</span>
          <label className="search-shell library-search-shell" aria-label="Search artists, tracks, albums">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search artists, tracks, albums..." />
          </label>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <img
            className="profile-avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJUv5GegwGckWhxAv-E4ntDINqtUNQ0QAVPpZ9EKTnFEKuh3AC9DsXXGx82RcE93LJj_Uk02_6oW5z3JmOWIrL5Z-c4ZYu7XmlKurCckRI4sxQWgdHuODonFyBiI4cFGsXpi1gda5a8WY-xh5oFnWVTeQ3xmvOKt50rQPCLwe8CoQ9BRCKuVQg7598g4bM0F6Uc5fUj_ZPfpIBC0Q2Lcm_OQTCqYydU5u9N7S9Oj6JKVGlj7d0iHfotUf2UlkhqXSAVHJ0aha-X6s"
            alt="User profile"
          />
        </div>
      </header>

      <main className="content library-content">
        <section className="library-hero">
          <img
            className="library-hero-image"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwaWhBvwICJW8zi07Y_Wh3V2c3popPuxBV9NuCZLq3sGXJ3ner1nlshUCw_mm8oBl5rT9QbNWmkKkbKAyqo4QCu-58VfH_A_1Ae1yGj8rYMK5TON1O3Rzg0V84BnQIiy4jPjxaXRVQNiwvdf6-UcvFE9Qv1pyjFbBcBT-gCXlDW2KG2cn5XfJoq0jR3JINKbEk0CXhp6DgW4LZip5PmdUAsixM6BaaV75phuaOM1RdwJnoQ1IXQ7eeFrVXLy7RfS0x-E-y_V_sv98"
            alt="Cyber Phonic"
          />
          <div className="library-hero-overlay" />
          <div className="library-hero-copy">
            <span className="library-verified-pill">
              <span className="material-symbols-outlined filled">verified</span>
              Verified Artist
            </span>
            <h1>Cyber Phonic</h1>
            <p>4,284,931 monthly listeners</p>
          </div>
        </section>

        <section className="library-controls">
          <button type="button" className="library-play-button" aria-label="Play artist">
            <span className="material-symbols-outlined filled">play_arrow</span>
          </button>
          <button type="button" className="library-follow-button">
            Follow
          </button>
          <button type="button" className="icon-button" aria-label="More options">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </section>

        <section className="library-grid">
          <div className="library-main-column">
            <section className="library-section">
              <h2 className="library-section-title">Popular</h2>
              <div className="library-track-list">
                {popularTracks.map((track) => (
                  <article
                    key={track.title}
                    className={`library-track-row ${track.active ? 'active' : ''}`}
                  >
                    <div className="library-track-index">
                      {track.active ? (
                        <span className="material-symbols-outlined filled">graphic_eq</span>
                      ) : (
                        <>
                          <span className="library-rank-default">{track.rank}</span>
                          <span className="material-symbols-outlined library-rank-hover filled">
                            play_arrow
                          </span>
                        </>
                      )}
                    </div>

                    <div className="track-art">
                      <img src={track.image} alt={track.title} />
                    </div>

                    <div className="library-track-copy">
                      <h3>{track.title}</h3>
                      <p>{track.plays}</p>
                    </div>

                    <div className="library-track-meta">
                      <button
                        type="button"
                        className={`icon-button library-like-button ${track.liked ? 'favorite-active' : ''}`}
                        aria-label="Favorite"
                      >
                        <span className={`material-symbols-outlined ${track.liked ? 'filled' : ''}`}>
                          favorite
                        </span>
                      </button>
                      <span>{track.duration}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="library-section">
              <div className="section-header library-section-header">
                <h2 className="library-section-title">Discography</h2>
                <a href="#">Show all</a>
              </div>

              <div className="library-album-grid">
                {discography.map((album) => (
                  <article key={album.title} className="library-album-card">
                    <div className="library-album-art">
                      <img src={album.image} alt={album.title} />
                      <button type="button" className="play-fab" aria-label={`Play ${album.title}`}>
                        <span className="material-symbols-outlined filled">play_arrow</span>
                      </button>
                    </div>
                    <h3>{album.title}</h3>
                    <p>{album.meta}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="library-side-column">
            <section className="library-panel">
              <h2 className="library-panel-title">Fans also like</h2>
              <div className="library-artist-list">
                {relatedArtists.map((artist) => (
                  <article key={artist.name} className="library-artist-row">
                    <img src={artist.image} alt={artist.name} />
                    <div>
                      <h3>{artist.name}</h3>
                      <p>Artist</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="library-pick-card">
              <span className="library-pick-badge">Artist Pick</span>
              <div className="library-pick-body">
                <img
                  className="library-pick-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6hGBHchQ9TSP4O4uQ882jmpQOsTa-ssnPcdVrcrnqiO6ZOKuClBAnqWUwc3p_Wk4JjcZD8VrDNX1qWcja2uevAJL_Z-r7XnmUoppvBmTI0qma32Qb1IbcIFroEt5Yke3PJzPUvtamIjdIy2WVXjqaWIcVuDmqhQyZcXFcEKxuV74CQ6vcO5NW5I0qiGxtfc8_qAjwmy8x5rGurnYFyLC7PnPfh8vCBbs11oHZqU_40DFhFP0U6mQmX5zJywfi3SBxG6NWdoFIPYk"
                  alt="Synthetic Vision"
                />
                <div>
                  <div className="library-pick-meta">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA52X4S_UhjLJhPRH6zqz6EPDhu1OhXSnaMmokzYa6LP0FK4k-Kfy3mFeVRs7NwY3Wv-5ZpwIT3MC0be0NkbWl-QKIF2y-qhhLWFtegG-gJ-AngGl4wv-RvHwNa_l6Z8ySryCISrfGLpGlcSPpkahToGCg_GMyOA6H_hlTfR15nemnkqZ8xqFy3icEpuTaMkImoM4qkobh5BMCxgnVzpL5_lWCJgpH0mgXczj07NRgCUlUIOmWzo7chZcHliaFqViDCrPijz3fpQA"
                      alt="Cyber Phonic avatar"
                    />
                    <span>Cyber Phonic&apos;s choice</span>
                  </div>
                  <h3>Synthetic Vision</h3>
                  <p>New Full Album</p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>

      <footer className="player-bar library-player-bar">
        <div className="player-now-playing">
          <div className="now-art">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzEfcl32P6b9PtWBFKL89UGwOhdDIVbHRnmL9ZTiUXBuLPwpusm6YtUT_gDmlM8GEAduZ9GmLYxDXZ-d5OYzutuKIfDJwM6v2wDs0m2WqSeQk_lRYDowAyiJ1VP7LOQ2yA84yX_ZAaEgU_igfijiIc3uI8K1Abbe5ZrbkD1692iIN4phg-M0l4UaDKqQvGJ7hv8WEr1s4-XBUSNz4yCKF84-PFlwhXXfheaf6XpOCJO6aMtmw1K7QToblp9LhhjBQm1K9-j-5cbP4"
              alt="Now playing"
            />
          </div>
          <div className="now-meta">
            <h4>Liquid Glass</h4>
            <p>Cyber Phonic</p>
          </div>
          <button type="button" className="icon-button favorite-active" aria-label="Liked">
            <span className="material-symbols-outlined filled">favorite</span>
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
            <button type="button" className="play-main" aria-label="Pause">
              <span className="material-symbols-outlined filled">pause</span>
            </button>
            <button type="button" className="icon-button light" aria-label="Next">
              <span className="material-symbols-outlined filled">skip_next</span>
            </button>
            <button type="button" className="icon-button light" aria-label="Repeat">
              <span className="material-symbols-outlined">repeat</span>
            </button>
          </div>

          <div className="progress-row library-progress-row">
            <span>2:14</span>
            <div className="progress-bar library-progress-bar">
              <div className="progress-current library-progress-current" />
              <div className="progress-thumb" />
            </div>
            <span>4:15</span>
          </div>
        </div>

        <div className="player-extra">
          <button type="button" className="icon-button light" aria-label="Equalizer">
            <span className="material-symbols-outlined">graphic_eq</span>
          </button>
          <button type="button" className="icon-button light" aria-label="Playlist">
            <span className="material-symbols-outlined">playlist_play</span>
          </button>
          <div className="volume-shell library-volume-shell">
            <span className="material-symbols-outlined">volume_up</span>
            <div className="volume-bar">
              <div className="volume-current library-volume-current" />
            </div>
          </div>
        </div>
      </footer>

      <nav className="mobile-nav library-mobile-nav">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.label} to={item.href} className={item.active ? 'active' : ''}>
            <span className={`material-symbols-outlined ${item.active ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label.replace('Your ', '')}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Library
