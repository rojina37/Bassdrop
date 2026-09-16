import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Custom dropdown standing in for a native <select> — browsers render the
// native option list as an unstylable OS popup (wrong theme, floats over the
// trigger instead of below it), so this renders our own themed listbox
// via a portal, positioned under the trigger regardless of ancestor scroll
// containers (e.g. the admin dialog's overflow-y: auto).
const Select = ({ id, value, onChange, options, placeholder = 'Select…' }) => {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState(null)
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const handleClickOutside = (event) => {
      if (triggerRef.current?.contains(event.target)) return
      if (dropdownRef.current?.contains(event.target)) return
      setOpen(false)
    }
    const reposition = () => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect())
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  const selected = options.find((option) => option.value === value)

  return (
    <>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className="select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'select-value' : 'select-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="material-symbols-outlined select-caret">expand_more</span>
      </button>

      {open &&
        rect &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="select-dropdown"
            role="listbox"
            style={{ top: rect.bottom + 6, left: rect.left, width: rect.width }}
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={`select-option ${option.value === value ? 'active' : ''} ${option.className ?? ''}`}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  )
}

export default Select
