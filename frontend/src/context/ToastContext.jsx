import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})
  const remaining = useRef({})
  const startedAt = useRef({})

  const clearBookkeeping = (id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    delete remaining.current[id]
    delete startedAt.current[id]
  }

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    clearBookkeeping(id)
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++idCounter
      setToasts((current) => [...current, { id, message, type, duration, paused: false }])
      remaining.current[id] = duration
      startedAt.current[id] = Date.now()
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  // Hovering a toast pauses both its dismiss timer and the visual countdown bar
  // together — pausing only the animation would leave the bar frozen while the
  // toast still vanished underneath it.
  const pause = useCallback((id) => {
    clearTimeout(timers.current[id])
    const elapsed = Date.now() - (startedAt.current[id] ?? Date.now())
    remaining.current[id] = Math.max(0, (remaining.current[id] ?? 0) - elapsed)
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, paused: true } : toast)))
  }, [])

  const resume = useCallback(
    (id) => {
      startedAt.current[id] = Date.now()
      timers.current[id] = setTimeout(() => dismiss(id), remaining.current[id] ?? 0)
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, paused: false } : toast)))
    },
    [dismiss],
  )

  const value = { showToast, dismiss }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={`toast toast-${toast.type}`}
            style={{ '--toast-duration': `${toast.duration}ms` }}
            onClick={() => dismiss(toast.id)}
            onMouseEnter={() => pause(toast.id)}
            onMouseLeave={() => resume(toast.id)}
          >
            <span className="toast-icon">
              <span className="material-symbols-outlined">
                {toast.type === 'error' ? 'error' : 'check_circle'}
              </span>
            </span>
            <span className="toast-message">{toast.message}</span>
            <span
              className="toast-timer"
              style={{ animationPlayState: toast.paused ? 'paused' : 'running' }}
            />
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
