import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { apiFetch } from '../../../../lib/api'
import { formatDuration, mediaUrl } from '../../../../lib/format'
import Modal from '../../../../components/Modal'
import SongForm from './SongForm'

export const ViewSongsPage = () => {
  const { token } = useAuth()
  const [songs, setSongs] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingSong, setEditingSong] = useState(null)

  const load = () => {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    apiFetch(`/songs${query}`)
      .then(({ songs: list }) => setSongs(list))
      .catch(() => {})
  }

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const remove = async (song) => {
    setError('')
    try {
      await apiFetch(`/songs/${song.id}`, { method: 'DELETE', token })
      setSongs((current) => current.filter((s) => s.id !== song.id))
    } catch (err) {
      setError(err.message || 'Could not delete song.')
    }
  }

  const handleAdded = () => {
    setShowAdd(false)
    load()
  }

  const handleEdited = () => {
    setEditingSong(null)
    load()
  }

  return (
    <>
      <div className="admin-table-toolbar">
        <input
          type="search"
          placeholder="Search songs..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-search-input"
        />
        <button type="button" className="admin-primary-button" onClick={() => setShowAdd(true)}>
          + Add Song
        </button>
      </div>

      <div className="admin-table-card">
        {error && <p className="admin-form-error admin-table-banner">{error}</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Artist</th>
                <th>Genre</th>
                <th>Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song.id}>
                  <td>
                    {song.coverUrl ? (
                      <img src={mediaUrl(song.coverUrl)} alt="" className="admin-table-avatar" />
                    ) : (
                      <div className="admin-table-avatar admin-table-avatar-placeholder">
                        <span className="material-symbols-outlined">graphic_eq</span>
                      </div>
                    )}
                  </td>
                  <td className="admin-table-title">{song.title}</td>
                  <td>{song.artist.name}</td>
                  <td>
                    <span className="admin-table-pill">{song.genre.name}</span>
                  </td>
                  <td className="admin-table-sub">{formatDuration(song.duration)}</td>
                  <td className="admin-table-actions">
                    <button type="button" onClick={() => setEditingSong(song)} className="admin-table-edit">
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(song)} className="admin-table-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {songs.length === 0 && <p className="admin-table-empty">No songs found.</p>}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Song" description="Upload a track to the catalog." onClose={() => setShowAdd(false)}>
          <SongForm onSuccess={handleAdded} />
        </Modal>
      )}

      {editingSong && (
        <Modal
          title="Edit Song"
          description={`Update details for "${editingSong.title}".`}
          onClose={() => setEditingSong(null)}
        >
          <SongForm song={editingSong} onSuccess={handleEdited} />
        </Modal>
      )}
    </>
  )
}
