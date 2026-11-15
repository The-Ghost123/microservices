// src/components/StarRating.jsx
// Menampilkan rating bintang emas dengan ulasan pengguna.

export default function StarRating({ average = 0, total = 0, compact = false }) {
  if (!total && !average) return <span className="muted-text small">Belum ada ulasan</span>

  const avgNum = Number(average) || 0
  const filled = Math.min(5, Math.max(0, Math.round(avgNum)))

  return (
    <div className="stars-wrapper" title={`${avgNum.toFixed(1)} dari 5 (${total} ulasan)`}>
      <span className="stars-gold" aria-hidden="true">
        {'★'.repeat(filled)}
        <span className="stars-dim">{'★'.repeat(5 - filled)}</span>
      </span>
      <span className="rating-value">{avgNum.toFixed(1)}</span>
      {!compact && total > 0 && <span className="rating-count">({total} ulasan)</span>}
    </div>
  )
}
