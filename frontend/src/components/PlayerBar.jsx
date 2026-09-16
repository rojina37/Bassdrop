import React, { useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { formatDuration, mediaUrl } from '../lib/format'
import NowPlayingExpanded from './NowPlayingExpanded'

const variantConfig = {
  default: {
    footer: 'player-bar',
    progressRow: 'progress-row',
    progressBar: 'progress-bar',
    progressCurrent: 'progress-current',
    volumeShell: 'volume-shell',
    volumeCurrent: 'volume-current',
    thumb: false,
  },
  search: {
    footer: 'player-bar search-player-bar',
    progressRow: 'progress-row search-progress-row',
    progressBar: 'progress-bar search-progress-bar',
    progressCurrent: 'progress-current search-progress-current',
    volumeShell: 'volume-shell',
    volumeCurrent: 'volume-current search-volume-current',
    thumb: true,
  },
  library: {
    footer: 'player-bar library-player-bar',
    progressRow: 'progress-row library-progress-row',
    progressBar: 'progress-bar library-progress-bar',
    progressCurrent: 'progress-current library-progress-current',
    volumeShell: 'volume-shell library-volume-shell',
    volumeCurrent: 'volume-current library-volume-current',
    thumb: true,
  },
  playlists: {
    footer: 'player-bar',
    progressRow: 'progress-row',
    progressBar: 'progress-bar',
    progressCurrent: 'progress-current',
    volumeShell: 'volume-shell',
    volumeCurrent: 'volume-current',
    thumb: false,
  },
}

const PlayerBar = ({ likedIds, onToggleLike, variant = 'default' }) => {
  const {
    currentSong,
    currentIndex,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    shuffle,
    repeatMode,
    playSong,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()

  const [showExpanded, setShowExpanded] = useState(false)

  const classes = variantConfig[variant] ?? variantConfig.default
  const liked = currentSong ? likedIds?.has(currentSong.id) : false
  const progressPercent = duration ? (progress / duration) * 100 : 0

  const openExpanded = () => currentSong && setShowExpanded(true)

  return (
    <>
      <footer className={classes.footer}>
        {currentSong ? (
          <>
            <div className="player-now-playing">
              <div
                className="now-art"
                role="button"
                tabIndex={0}
                aria-label="Expand now playing"
                style={{ cursor: 'pointer' }}
                onClick={openExpanded}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') setShowExpanded(true)
                }}
              >
                {currentSong.coverUrl ? (
                  <img src={mediaUrl(currentSong.coverUrl)} alt="Currently playing" />
                ) : (
                  <div className="now-art-placeholder">
                    <span className="material-symbols-outlined">music_note</span>
                  </div>
                )}
                <div className="track-art-overlay">
                  <span className="material-symbols-outlined">expand_less</span>
                </div>
              </div>
              <div className="now-meta">
                <h4>{currentSong.title}</h4>
                <p>{currentSong.artist?.name ?? ''}</p>
              </div>
              <button
                type="button"
                className={`icon-button ${liked ? 'favorite-active' : ''}`}
                aria-label="Liked"
                onClick={() => onToggleLike?.(currentSong.id)}
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>

            <div className="player-controls">
              <div className="control-row">
                <button
                  type="button"
                  className={`icon-button light ${shuffle ? 'favorite-active' : ''}`}
                  aria-label="shuffle"
                  onClick={toggleShuffle}
                >
                  <span className="material-symbols-outlined filled">shuffle</span>
                </button>
                <button type="button" className="icon-button light" aria-label="previous" onClick={previous}>
                  <span className="material-symbols-outlined filled">skip_previous</span>
                </button>
                <button
                  type="button"
                  className="play-main"
                  aria-label={isPlaying ? 'pause' : 'play'}
                  onClick={togglePlay}
                >
                  <span className="material-symbols-outlined filled">{isPlaying ? 'pause_circle' : 'play_circle'}</span>
                </button>
                <button type="button" className="icon-button light" aria-label="next" onClick={next}>
                  <span className="material-symbols-outlined filled">skip_next</span>
                </button>
                <button
                  type="button"
                  className={`icon-button light ${repeatMode !== 'off' ? 'favorite-active' : ''}`}
                  aria-label="repeat"
                  onClick={cycleRepeat}
                >
                  <span className="material-symbols-outlined filled">
                    {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                  </span>
                </button>
              </div>
              <div className={classes.progressRow}>
                <span>{formatDuration(progress)}</span>
                <div
                  className={classes.progressBar}
                  role="slider"
                  aria-label="Seek"
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={progress}
                  tabIndex={0}
                  style={{ cursor: duration ? 'pointer' : 'default' }}
                  onClick={(event) => {
                    if (!duration) return
                    const rect = event.currentTarget.getBoundingClientRect()
                    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
                    seek(ratio * duration)
                  }}
                >
                  <div className={classes.progressCurrent} style={{ width: `${progressPercent}%` }} />
                  {classes.thumb && (
                    <div className="progress-thumb" style={{ left: `calc(${progressPercent}% - 0.375rem)` }} />
                  )}
                </div>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="player-extra">
              <button type="button" className="icon-button light" aria-label="Queue" onClick={openExpanded}>
                <span className="material-symbols-outlined">queue_music</span>
              </button>
              <div className={classes.volumeShell}>
                <button
                  type="button"
                  className="icon-button light"
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                >
                  <span className="material-symbols-outlined">
                    {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
                <div
                  className="volume-bar"
                  role="slider"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={volume}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect()
                    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
                    setVolume(ratio)
                  }}
                >
                  <div className={classes.volumeCurrent} style={{ width: `${volume * 100}%` }} />
                </div>
              </div>
              <button type="button" className="icon-button light" aria-label="Fullscreen" onClick={openExpanded}>
                <span className="material-symbols-outlined">open_in_full</span>
              </button>
            </div>
          </>
        ) : (
          <div className="player-empty-state">
            <span className="material-symbols-outlined">library_music</span>
            <p>Choose a song to start listening</p>
          </div>
        )}
      </footer>

      {showExpanded && currentSong && (
        <NowPlayingExpanded
          song={currentSong}
          queue={queue}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          shuffle={shuffle}
          repeatMode={repeatMode}
          liked={liked}
          volume={volume}
          onClose={() => setShowExpanded(false)}
          onTogglePlay={togglePlay}
          onNext={next}
          onPrevious={previous}
          onSeek={seek}
          onToggleShuffle={toggleShuffle}
          onCycleRepeat={cycleRepeat}
          onSetVolume={setVolume}
          onToggleLike={() => onToggleLike?.(currentSong.id)}
          onSelectSong={(song) => playSong(song, queue)}
        />
      )}
    </>
  )
}

export default PlayerBar
