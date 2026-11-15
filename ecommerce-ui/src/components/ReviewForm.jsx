// src/components/ReviewForm.jsx
// Formulir interaktif menulis review dengan bintang interaktif untuk user aktif.

import { useState } from 'react'
import { createReview } from '../api/reviewApi'
import { describeError } from '../utils/format'
import { showToast } from '../utils/toast'

export default function ReviewForm({ productId, userId, onCreated }) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!comment.trim()) {
      setError(new Error('Silakan tulis komentar ulasan Anda.'))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createReview({
        productId: Number(productId),
        userId: Number(userId),
        rating: Number(rating),
        comment: comment.trim(),
      })
      setComment('')
      showToast('Terima kasih! Ulasan Anda berhasil diterbitkan.')
      if (onCreated) onCreated()
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const activeStars = hoverRating || rating

  return (
    <form className="review-form-card" onSubmit={handleSubmit}>
      <div className="review-form-header">
        <div className="review-user-avatar">U{userId}</div>
        <div>
          <h4 className="review-form-title">Tulis Ulasan Pembeli</h4>
          <p className="review-form-subtitle">Sebagai User #{userId} • Verifikasi Transaksi</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Beri Penilaian Bintang</label>
        <div className="interactive-stars" role="radiogroup" aria-label="Pilih rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`star-btn ${star <= activeStars ? 'star-active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} bintang`}
            >
              ★
            </button>
          ))}
          <span className="rating-helper-text">
            {rating === 5 && 'Sempurna! Sangat puas'}
            {rating === 4 && 'Bagus sekali'}
            {rating === 3 && 'Cukup memuaskan'}
            {rating === 2 && 'Kurang memuaskan'}
            {rating === 1 && 'Sangat mengecewakan'}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="review-comment" className="form-label">
          Pengalaman & Kualitas Poster
        </label>
        <textarea
          id="review-comment"
          rows="3"
          maxLength="1000"
          className="form-textarea"
          placeholder="Ceritakan ketajaman warna cetakan, keaslian bahan kertas, dan kondisi kemasan tabung..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <span className="char-count">{comment.length}/1000</span>
      </div>

      {error && <p className="alert alert-error">{describeError(error)}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan Sekarang'}
      </button>
    </form>
  )
}
