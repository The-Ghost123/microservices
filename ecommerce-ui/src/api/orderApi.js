// src/api/orderApi.js
// Client untuk order-service (port 3003) dan transaksi pesanan tanpa fitur pembayaran.
import { request } from './http'

const BASE_URL = import.meta.env.VITE_ORDER_URL || 'http://localhost:3003'

export async function createOrder(userId) {
  try {
    const res = await request(BASE_URL, '/orders', {
      method: 'POST',
      body: { user_id: Number(userId) },
    })
    return res.data
  } catch {
    return simulateLocalOrder(userId)
  }
}

export async function getOrder(orderId) {
  try {
    const res = await request(BASE_URL, `/orders/${orderId}`)
    return res.data
  } catch {
    const localOrders = JSON.parse(localStorage.getItem('shop_all_orders') || '[]')
    const found = localOrders.find((o) => String(o.id) === String(orderId))
    if (found) return found
    throw new Error('Pesanan tidak ditemukan')
  }
}

export async function getUserOrders(userId) {
  try {
    const res = await request(BASE_URL, `/orders/user/${userId}`)
    return res.data
  } catch {
    const key = `shop_orders_${userId}`
    const orders = JSON.parse(localStorage.getItem(key) || '[]')
    return orders
  }
}

function simulateLocalOrder(userId) {
  const cartKey = `shop_cart_${userId}`
  const localCart = JSON.parse(localStorage.getItem(cartKey) || '{"items":[]}')

  const orderId = `ORD-${Date.now().toString().slice(-6)}`
  const newOrder = {
    id: orderId,
    user_id: Number(userId),
    status: 'TERKONFIRMASI',
    created_at: new Date().toISOString(),
    total_amount: localCart.totalPrice || 0,
    items: localCart.items || [],
  }

  const key = `shop_orders_${userId}`
  const userOrders = JSON.parse(localStorage.getItem(key) || '[]')
  userOrders.unshift(newOrder)
  localStorage.setItem(key, JSON.stringify(userOrders))

  const allOrders = JSON.parse(localStorage.getItem('shop_all_orders') || '[]')
  allOrders.unshift(newOrder)
  localStorage.setItem('shop_all_orders', JSON.stringify(allOrders))

  // Kosongkan keranjang setelah order dibuat
  localStorage.setItem(cartKey, JSON.stringify({ items: [] }))

  return newOrder
}
