import React from 'react'
import Modal from './Modal'

const ConfirmDeleteModal = ({ title, description, confirmLabel = 'Delete', onCancel, onConfirm }) => (
  <Modal title={title} description={description} onClose={onCancel}>
    <div className="admin-dialog-actions">
      <button type="button" className="admin-secondary-button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" className="admin-danger-button" onClick={onConfirm}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
)

export default ConfirmDeleteModal
