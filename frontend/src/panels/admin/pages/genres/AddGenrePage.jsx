import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { apiFetch } from '../../../../lib/api'
import Modal from '../../../../components/Modal'
import AddGenreForm from './AddGenreForm'

const AddGenrePage = () => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [genres, setGenres] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const loadGenres = () => {
    apiFetch('/genres')
      .then(({ genres: list }) => setGenres(list))
      .catch(() => {})
  }

  useEffect(loadGenres, [])

  const visibleGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const handleAdded = () => {
    setShowAdd(false)
    loadGenres()
  }

  const startEdit = (genre) => {
    setError('')
    setEditingId(genre.id)
    setEditName(genre.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    setError('')

    setSavingEdit(true)
    try {
      const { genre } = await apiFetch(`/genres/${editingId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ name: editName }),
      })
      showToast(`Renamed to "${genre.name}".`)
      cancelEdit()
      loadGenres()
    } catch (err) {
      setError(err.message || 'Could not update genre.')
    } finally {
      setSavingEdit(false)
    }
  }

  const remove = async (genre) => {
    setError('')
    try {
      await apiFetch(`/genres/${genre.id}`, { method: 'DELETE', token })
      showToast(`Deleted "${genre.name}".`)
      setGenres((current) => current.filter((g) => g.id !== genre.id))
    } catch (err) {
      setError(err.message || 'Could not delete genre.')
    }
  }

  return (
    <>
      <div className="admin-table-toolbar">
        <input
          type="search"
          placeholder="Search genres..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-search-input"
        />
        <button type="button" className="admin-primary-button" onClick={() => setShowAdd(true)}>
          + Add Genre
        </button>
      </div>

      <div className="admin-table-card">
        {error && <p className="admin-form-error admin-table-banner">{error}</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Songs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleGenres.map((genre) => (
                <tr key={genre.id}>
                  {editingId === genre.id ? (
                    <td colSpan={3}>
                      <form className="admin-inline-edit" onSubmit={saveEdit}>
                        <input
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          autoFocus
                        />
                        <div className="admin-table-actions">
                          <button type="submit" disabled={savingEdit} className="admin-table-edit">
                            {savingEdit ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" onClick={cancelEdit} className="admin-table-delete">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="admin-table-title">{genre.name}</td>
                      <td>
                        <span className="admin-table-pill">{genre.songCount} songs</span>
                      </td>
                      <td className="admin-table-actions">
                        <button type="button" onClick={() => startEdit(genre)} className="admin-table-edit">
                          Edit
                        </button>
                        <button type="button" onClick={() => remove(genre)} className="admin-table-delete">
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {visibleGenres.length === 0 && <p className="admin-table-empty">No genres found.</p>}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Genre" description="Create a new genre for the catalog." onClose={() => setShowAdd(false)}>
          <AddGenreForm onSuccess={handleAdded} />
        </Modal>
      )}
    </>
  )
}

export default AddGenrePage
