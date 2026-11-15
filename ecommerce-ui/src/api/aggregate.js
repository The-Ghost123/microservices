// src/api/aggregate.js
// Penggabungan data dari beberapa service (product, review, cart)
import { getCart } from './cartApi'
import { getProduct, getProducts } from './productApi'
import { getProductReviews } from './reviewApi'

// Daftar produk beserta ringkasan rating.
export async function getProductsWithRating() {
  const products = await getProducts()

  return Promise.all(
    products.map(async (product) => {
      try {
        const { summary } = await getProductReviews(product.id)
        return { ...product, rating: summary }
      } catch {
        return { ...product, rating: null }
      }
    }),
  )
}

// Detail satu produk beserta review-nya.
export async function getProductDetail(productId) {
  const [productResult, reviewResult] = await Promise.allSettled([
    getProduct(productId),
    getProductReviews(productId),
  ])

  if (productResult.status === 'rejected') throw productResult.reason

  return {
    product: productResult.value,
    reviews: reviewResult.status === 'fulfilled' ? reviewResult.value : null,
  }
}

// Isi keranjang beserta nama dan harga tiap produk.
export async function getCartDetail(userId) {
  const cart = await getCart(userId)
  const rawItems = cart && Array.isArray(cart.items) ? cart.items : []

  const items = await Promise.all(
    rawItems.map(async (item) => {
      try {
        const product = await getProduct(item.product_id)
        return { ...item, product }
      } catch {
        return { ...item, product: null }
      }
    }),
  )

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product ? Number(item.product.price) * item.quantity : 0),
    0,
  )

  const key = `shop_cart_${userId}`
  const currentLocal = JSON.parse(localStorage.getItem(key) || '{}')
  localStorage.setItem(key, JSON.stringify({ ...currentLocal, user_id: Number(userId), items, totalPrice }))

  return { items, totalPrice }
}
