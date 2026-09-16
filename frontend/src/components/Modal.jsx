import React, { useEffect } from 'react'

const Modal = ({ title, description, onClose, children }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="admin-dialog-backdrop" onClick={onClose}>
      <div className="admin-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="admin-dialog-header">
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
