// src/api/reviewApi.js
// Client untuk review-service dengan fallback ulasan produk yang sudah ada.
import { EXISTING_PRODUCTS } from '../data/products'
import { request } from './http'

const BASE_URL = import.meta.env.VITE_REVIEW_URL

export async function getProductReviews(productId) {
  try {
    const res = await request(BASE_URL, `/reviews/product/${productId}`)
    if (res && res.data) {
      return res.data
    }
  } catch {
    // fallback lokal
  }

  const product = EXISTING_PRODUCTS.find((p) => String(p.id) === String(productId))
  const localExtraReviews = JSON.parse(
    localStorage.getItem(`shop_reviews_${productId}`) || '[]'
  )

  const defaultReviews = product?.reviews || []
  const allReviews = [...localExtraReviews, ...defaultReviews]

  const total = allReviews.length
  const avg =
    total > 0
      ? Number((allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / total).toFixed(1))
      : 5.0

  return {
    summary: {
      average_rating: avg,
      total_reviews: total,
    },
    reviews: allReviews,
  }
}

export async function createReview({ productId, userId, rating, comment }) {
  try {
    const res = await request(BASE_URL, '/reviews', {
      method: 'POST',
      body: { product_id: Number(productId), user_id: Number(userId), rating: Number(rating), comment },
    })
    return res.data
  } catch {
    const key = `shop_reviews_${productId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const newRev = {
      id: `rev-${Date.now()}`,
      product_id: Number(productId),
      user_id: Number(userId),
      rating: Number(rating),
      comment,
      created_at: new Date().toISOString(),
    }
    existing.unshift(newRev)
    localStorage.setItem(key, JSON.stringify(existing))
    return newRev
  }
}
