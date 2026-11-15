// src/utils/toast.js
// Event emitter sederhana untuk notifikasi toast global.

let toastListener = null

export function registerToastListener(listener) {
  toastListener = listener
  return () => {
    toastListener = null
  }
}

export function showToast(message, type = 'success') {
  if (toastListener) {
    toastListener({ message, type, id: Date.now() + Math.random() })
  }
}
