// src/components/Toast.jsx
// Menampilkan notifikasi popup yang rapi dan halus untuk aksi pengguna.

import { useEffect, useState } from 'react'
import { registerToastListener } from '../utils/toast'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unregister = registerToastListener((toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3500)
    })
    return unregister
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-text">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
