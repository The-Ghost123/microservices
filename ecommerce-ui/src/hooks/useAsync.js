// src/hooks/useAsync.js
// Hook untuk menjalankan fungsi async dan melacak statusnya: loading, data, atau error.
// Dipakai di setiap halaman supaya pola memuat data tidak ditulis berulang.

import { useEffect, useState } from 'react'

export function useAsync(asyncFn, deps = []) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: null })

  // key mengidentifikasi permintaan yang sedang berlaku. Hasil hanya dianggap sah
  // kalau key-nya sama. Kalau deps berubah, atau reload() dipanggil, key berubah
  // dan tampilan otomatis kembali ke status loading.
  const key = `${JSON.stringify(deps)}:${reloadCount}`

  useEffect(() => {
    let cancelled = false

    asyncFn()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ key, data: null, error })
      })

    // Dijalankan saat komponen ditutup atau key berubah: abaikan hasil permintaan lama.
    return () => {
      cancelled = true
    }
    // asyncFn sengaja tidak dimasukkan: fungsi itu dibuat ulang di setiap render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = result.key !== key

  return {
    loading,
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    reload: () => setReloadCount((count) => count + 1),
  }
}
