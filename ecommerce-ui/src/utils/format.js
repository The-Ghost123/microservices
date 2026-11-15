// src/utils/format.js
// Fungsi pembantu untuk memformat nilai mata uang, tanggal, dan pesan error.

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export const formatRupiah = (value) => {
  const num = Number(value)
  return isNaN(num) ? 'Rp 0' : rupiah.format(num)
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function describeError(error) {
  if (!error) return 'Terjadi kesalahan sistem.'
  if (typeof error === 'string') return error
  const details = error.errors ? Object.values(error.errors).flat() : []
  return details.length ? `${error.message}: ${details.join(', ')}` : error.message || 'Terjadi kesalahan.'
}
