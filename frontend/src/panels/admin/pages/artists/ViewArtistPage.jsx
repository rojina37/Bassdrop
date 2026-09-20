import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { apiFetch } from '../../../../lib/api'
import { mediaUrl } from '../../../../lib/format'
import Modal from '../../../../components/Modal'
import ConfirmDeleteModal from '../../../../components/ConfirmDeleteModal'
import AddArtistForm from './AddArtistForm'

const ViewArtistPage = () => {
  const { token } = useAuth()
  const [artists, setArtists] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  const [editImageFile, setEditImageFile] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = () => {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    apiFetch(`/artists${query}`)
      .then(({ artists: list }) => setArtists(list))
      .catch(() => {})
  }

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const startEdit = (artist) => {
    setError('')
    setEditingId(artist.id)
    setEditForm({ name: artist.name, bio: artist.bio ?? '' })
    setEditImageFile(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', bio: '' })
    setEditImageFile(null)
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    setError('')

    const body = new FormData()
    body.append('name', editForm.name)
    body.append('bio', editForm.bio)
    if (editImageFile) body.append('image', editImageFile)

    setSavingEdit(true)
    try {
      await apiFetch(`/artists/${editingId}`, { method: 'PATCH', token, body })
      cancelEdit()
      load()
    } catch (err) {
      setError(err.message || 'Could not update artist.')
    } finally {
      setSavingEdit(false)
    }
  }

  const remove = async (artist) => {
    setError('')
    try {
      await apiFetch(`/artists/${artist.id}`, { method: 'DELETE', token })
      setArtists((current) => current.filter((a) => a.id !== artist.id))
    } catch (err) {
      setError(err.message || 'Could not delete artist.')
    }
  }

  const handleAdded = () => {
    setShowAdd(false)
    load()
  }

  return (
    <>
      <div className="admin-table-toolbar">
        <input
          type="search"
          placeholder="Search artists..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-search-input"
        />
        <button type="button" className="admin-primary-button" onClick={() => setShowAdd(true)}>
          + Add Artist
        </button>
      </div>

      <div className="admin-table-card">
        {error && <p className="admin-form-error admin-table-banner">{error}</p>}

        <div className="admin-artist-list">
          {artists.map((artist) => (
            <article key={artist.id} className="admin-artist-row">
              {editingId === artist.id ? (
                <form className="admin-form" onSubmit={saveEdit}>
                  <div className="admin-artist-edit-head">
                    <img
                      src={artist.imageUrl ? mediaUrl(artist.imageUrl) : undefined}
                      alt={artist.name}
                      className="admin-table-avatar admin-table-avatar-round"
                    />
                    <div className="admin-artist-edit-fields">
                      <input
                        value={editForm.name}
                        onChange={(event) => setEditForm((f) => ({ ...f, name: event.target.value }))}
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(event) => setEditForm((f) => ({ ...f, bio: event.target.value }))}
                        rows={2}
                        placeholder="Bio"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setEditImageFile(event.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                  <div className="admin-dialog-actions">
                    <button type="submit" disabled={savingEdit} className="admin-primary-button">
                      {savingEdit ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="admin-secondary-button">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-artist-row-main">
                  <img
                    src={artist.imageUrl ? mediaUrl(artist.imageUrl) : undefined}
                    alt={artist.name}
                    className="admin-table-avatar admin-table-avatar-round"
                  />
                  <div className="admin-artist-row-info">
                    <h3>{artist.name}</h3>
                    <p className="admin-table-sub">
                      {artist.songCount} songs · {artist.followerCount} followers
                    </p>
                    {artist.bio && <p className="admin-artist-bio">{artist.bio}</p>}
                  </div>
                  <div className="admin-table-actions">
                    <button type="button" onClick={() => startEdit(artist)} className="admin-table-edit">
                      Edit
                    </button>
                    <button type="button" onClick={() => setPendingDelete(artist)} className="admin-table-delete">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
          {artists.length === 0 && <p className="admin-table-empty">No artists found.</p>}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Artist" description="Add a new artist to the catalog." onClose={() => setShowAdd(false)}>
          <AddArtistForm onSuccess={handleAdded} />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDeleteModal
          title="Delete artist?"
          description={`This will permanently remove "${pendingDelete.name}" (${pendingDelete.songCount} songs). This can't be undone.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            remove(pendingDelete)
            setPendingDelete(null)
          }}
        />
      )}
    </>
  )
}

export default ViewArtistPage
