// src/api/cartApi.js
// Client untuk cart-service dengan fallback localStorage per user_id.
import { request } from './http'

const BASE_URL = import.meta.env.VITE_CART_URL

function getLocalCart(userId) {
  const key = `shop_cart_${userId}`
  const raw = localStorage.getItem(key)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // ignore
    }
  }
  return { user_id: Number(userId), items: [] }
}

function saveLocalCart(userId, cart) {
  const key = `shop_cart_${userId}`
  localStorage.setItem(key, JSON.stringify(cart))
}

export async function getCart(userId) {
  try {
    const res = await request(BASE_URL, `/carts/${userId}`)
    return res.data
  } catch {
    return getLocalCart(userId)
  }
}

export async function addToCart(userId, productId, quantity = 1) {
  try {
    const res = await request(BASE_URL, '/carts', {
      method: 'POST',
      body: { user_id: Number(userId), product_id: Number(productId), quantity: Number(quantity) },
    })
    return res.data
  } catch {
    const cart = getLocalCart(userId)
    const existingIndex = cart.items.findIndex((item) => Number(item.product_id) === Number(productId))

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity)
    } else {
      cart.items.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        user_id: Number(userId),
        product_id: Number(productId),
        quantity: Number(quantity),
      })
    }

    saveLocalCart(userId, cart)
    window.dispatchEvent(new Event('shop_cart_updated'))
    return cart
  }
}

export async function updateCartItem(itemId, quantity) {
  try {
    const res = await request(BASE_URL, `/carts/items/${itemId}`, {
      method: 'PUT',
      body: { quantity: Number(quantity) },
    })
    return res.data
  } catch {
    const currentUserId = Number(localStorage.getItem('userId')) || 1
    const cart = getLocalCart(currentUserId)
    const item = cart.items.find((i) => String(i.id) === String(itemId))
    if (item) {
      item.quantity = Math.max(1, Number(quantity))
      saveLocalCart(currentUserId, cart)
      window.dispatchEvent(new Event('shop_cart_updated'))
    }
    return item
  }
}

export async function removeCartItem(itemId) {
  try {
    return await request(BASE_URL, `/carts/items/${itemId}`, { method: 'DELETE' })
  } catch {
    const currentUserId = Number(localStorage.getItem('userId')) || 1
    const cart = getLocalCart(currentUserId)
    cart.items = cart.items.filter((i) => String(i.id) !== String(itemId))
    saveLocalCart(currentUserId, cart)
    window.dispatchEvent(new Event('shop_cart_updated'))
    return { success: true }
  }
}

export async function clearCart(userId) {
  try {
    return await request(BASE_URL, `/carts/${userId}`, { method: 'DELETE' })
  } catch {
    saveLocalCart(userId, { user_id: Number(userId), items: [] })
    window.dispatchEvent(new Event('shop_cart_updated'))
    return { success: true }
  }
}
