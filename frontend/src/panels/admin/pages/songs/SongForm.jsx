import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { apiFetch } from '../../../../lib/api'
import Select from '../../../../components/Select'

const NEW_OPTION = '__new__'

// Add Song (no `song` prop) and Edit Song (`song` prop, pre-filled, PATCHes instead
// of POSTing, audio/cover files stay untouched unless a new one is chosen) share
// this same form.
export const SongForm = ({ song, onSuccess }) => {
  const isEditing = Boolean(song)
  const { token } = useAuth()
  const { showToast } = useToast()
  const [artists, setArtists] = useState([])
  const [genres, setGenres] = useState([])
  const [form, setForm] = useState({
    title: song?.title ?? '',
    album: song?.album ?? '',
    duration: song?.duration ?? 0,
    artistId: song?.artist.id ?? '',
    genreId: song?.genre.id ?? '',
  })
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Quick-add so picking "+ Add new artist/genre" never means abandoning an
  // in-progress upload just to go create one first.
  const [newArtistName, setNewArtistName] = useState(null)
  const [newArtistImage, setNewArtistImage] = useState(null)
  const [newGenreName, setNewGenreName] = useState(null)
  const [creatingArtist, setCreatingArtist] = useState(false)
  const [creatingGenre, setCreatingGenre] = useState(false)

  const objectUrlRef = useRef(null)

  useEffect(() => {
    apiFetch('/artists?take=100')
      .then(({ artists: list }) => setArtists(list))
      .catch(() => {})
    apiFetch('/genres')
      .then(({ genres: list }) => setGenres(list))
      .catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleArtistChange = (value) => {
    if (value === NEW_OPTION) {
      setNewArtistName('')
      setNewArtistImage(null)
      return
    }
    setForm((current) => ({ ...current, artistId: value }))
  }

  const handleGenreChange = (value) => {
    if (value === NEW_OPTION) {
      setNewGenreName('')
      return
    }
    setForm((current) => ({ ...current, genreId: value }))
  }

  const createArtist = async (event) => {
    event.preventDefault()
    const name = newArtistName.trim()
    if (!name) return

    setCreatingArtist(true)
    try {
      const body = new FormData()
      body.append('name', name)
      if (newArtistImage) body.append('image', newArtistImage)
      const { artist } = await apiFetch('/artists', { method: 'POST', token, body })
      setArtists((current) => [...current, artist].sort((a, b) => a.name.localeCompare(b.name)))
      setForm((current) => ({ ...current, artistId: artist.id }))
      setNewArtistName(null)
      setNewArtistImage(null)
    } catch (err) {
      setError(err.message || 'Could not add artist.')
    } finally {
      setCreatingArtist(false)
    }
  }

  const createGenre = async (event) => {
    event.preventDefault()
    const name = newGenreName.trim()
    if (!name) return

    setCreatingGenre(true)
    try {
      const { genre } = await apiFetch('/genres', {
        method: 'POST',
        token,
        body: JSON.stringify({ name }),
      })
      setGenres((current) => [...current, genre].sort((a, b) => a.name.localeCompare(b.name)))
      setForm((current) => ({ ...current, genreId: genre.id }))
      setNewGenreName(null)
      showToast(`Added genre "${genre.name}".`)
    } catch (err) {
      setError(err.message || 'Could not add genre.')
    } finally {
      setCreatingGenre(false)
    }
  }

  // Reads the track's real length client-side instead of asking the admin to
  // type it in seconds — nobody knows a song's exact duration off the top of
  // their head.
  const handleAudioChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setAudioFile(file)
    if (!file) return

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url

    const probe = new Audio()
    probe.preload = 'metadata'
    probe.onloadedmetadata = () => {
      setForm((current) => ({ ...current, duration: Math.round(probe.duration) }))
    }
    probe.src = url
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!isEditing && !audioFile) {
      setError('An audio file is required.')
      return
    }

    const body = new FormData()
    body.append('title', form.title)
    if (form.album) body.append('album', form.album)
    if (form.duration) body.append('duration', String(form.duration))
    body.append('artistId', form.artistId)
    body.append('genreId', form.genreId)
    if (audioFile) body.append('audio', audioFile)
    if (coverFile) body.append('cover', coverFile)

    setSubmitting(true)
    try {
      const { song: saved } = await apiFetch(isEditing ? `/songs/${song.id}` : '/songs', {
        method: isEditing ? 'PATCH' : 'POST',
        token,
        body,
      })
      showToast(isEditing ? `Updated "${saved.title}".` : `Added "${saved.title}".`)
      onSuccess(saved)
    } catch (err) {
      setError(err.message || (isEditing ? 'Could not update song.' : 'Could not add song.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Title</span>
        <input name="title" value={form.title} onChange={updateField} />
      </label>

      <label className="admin-field">
        <span>Album (optional)</span>
        <input name="album" value={form.album} onChange={updateField} />
      </label>

      <div className="admin-field-row">
        <div className="admin-field">
          <label htmlFor="song-artist-select">Artist</label>
          <Select
            id="song-artist-select"
            value={form.artistId}
            onChange={handleArtistChange}
            placeholder="Select artist"
            options={[
              ...artists.map((artist) => ({ value: artist.id, label: artist.name })),
              { value: NEW_OPTION, label: '+ Add new artist…', className: 'select-option-add' },
            ]}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="song-genre-select">Genre</label>
          <Select
            id="song-genre-select"
            value={form.genreId}
            onChange={handleGenreChange}
            placeholder="Select genre"
            options={[
              ...genres.map((genre) => ({ value: genre.id, label: genre.name })),
              { value: NEW_OPTION, label: '+ Add new genre…', className: 'select-option-add' },
            ]}
          />
        </div>
      </div>

      {newArtistName !== null && (
        <div className="admin-quick-add-panel">
          <input
            value={newArtistName}
            onChange={(event) => setNewArtistName(event.target.value)}
            placeholder="New artist name"
            autoFocus
          />
          <label className="admin-quick-add-image">
            <span>Photo (optional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setNewArtistImage(event.target.files?.[0] ?? null)}
            />
          </label>
          <div className="admin-quick-add-actions">
            <button type="button" onClick={createArtist} disabled={creatingArtist || !newArtistName.trim()}>
              {creatingArtist ? 'Adding…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNewArtistName(null)
                setNewArtistImage(null)
              }}
              className="admin-quick-add-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {newGenreName !== null && (
        <div className="admin-quick-add">
          <input
            value={newGenreName}
            onChange={(event) => setNewGenreName(event.target.value)}
            placeholder="New genre name"
            autoFocus
          />
          <button type="button" onClick={createGenre} disabled={creatingGenre || !newGenreName.trim()}>
            {creatingGenre ? 'Adding…' : 'Add'}
          </button>
          <button type="button" onClick={() => setNewGenreName(null)} className="admin-quick-add-cancel">
            Cancel
          </button>
        </div>
      )}

      <label className="admin-field">
        <span>{isEditing ? 'Replace audio file (optional)' : 'Audio file'}</span>
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
      </label>

      <label className="admin-field">
        <span>{isEditing ? 'Replace cover image (optional)' : 'Cover image (optional)'}</span>
        <input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} />
      </label>

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-dialog-actions">
        <button type="submit" className="admin-primary-button" disabled={submitting}>
          {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Song'}
        </button>
      </div>
    </form>
  )
}

export default SongForm
