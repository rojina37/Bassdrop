import React, { useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { apiFetch } from '../../../../lib/api'

export const AddArtistForm = ({ onSuccess }) => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const body = new FormData()
    body.append('name', name)
    if (bio) body.append('bio', bio)
    if (imageFile) body.append('image', imageFile)

    setSubmitting(true)
    try {
      const { artist } = await apiFetch('/artists', { method: 'POST', token, body })
      showToast(`Added "${artist.name}".`)
      onSuccess(artist)
    } catch (err) {
      setError(err.message || 'Could not add artist.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="admin-field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="admin-field">
        <span>Bio (optional)</span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} />
      </label>

      <label className="admin-field">
        <span>Image (optional)</span>
        <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
      </label>

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-dialog-actions">
        <button type="submit" className="admin-primary-button" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Artist'}
        </button>
      </div>
    </form>
  )
}

export default AddArtistForm
