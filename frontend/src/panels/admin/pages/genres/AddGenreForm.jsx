import React, { useState } from 'react'
import { useAuth } from '../../../../context/AuthContext'
import { useToast } from '../../../../context/ToastContext'
import { apiFetch } from '../../../../lib/api'

export const AddGenreForm = ({ onSuccess }) => {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    setSubmitting(true)
    try {
      const { genre } = await apiFetch('/genres', {
        method: 'POST',
        token,
        body: JSON.stringify({ name }),
      })
      showToast(`Added "${genre.name}".`)
      onSuccess(genre)
    } catch (err) {
      setError(err.message || 'Could not add genre.')
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

      {error && <p className="admin-form-error">{error}</p>}

      <div className="admin-dialog-actions">
        <button type="submit" className="admin-primary-button" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Genre'}
        </button>
      </div>
    </form>
  )
}

export default AddGenreForm
