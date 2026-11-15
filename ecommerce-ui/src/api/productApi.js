// src/api/productApi.js
// Client untuk product-service yang menyajikan produk yang ada di database.
import { getProductImage } from '../data/defaultImages'
import { EXISTING_PRODUCTS } from '../data/products'
import { request } from './http'

const BASE_URL = import.meta.env.VITE_PRODUCT_URL

function formatProduct(product) {
  const match = EXISTING_PRODUCTS.find((p) => Number(p.id) === Number(product.id))
  return {
    ...match,
    ...product,
    image: getProductImage(product),
    category: match?.category || 'Elektronik & Komputer',
    specs: match?.specs || [],
  }
}

export async function getProducts() {
  try {
    const res = await request(BASE_URL, '/products')
    if (res && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(formatProduct)
    }
    return EXISTING_PRODUCTS
  } catch {
    return EXISTING_PRODUCTS
  }
}

export async function getProduct(id) {
  try {
    const res = await request(BASE_URL, `/products/${id}`)
    if (res && res.data) {
      return formatProduct(res.data)
    }
    const found = EXISTING_PRODUCTS.find((p) => String(p.id) === String(id))
    if (found) return found
    throw new Error('Produk tidak ditemukan')
  } catch {
    const found = EXISTING_PRODUCTS.find((p) => String(p.id) === String(id))
    if (found) return found
    throw new Error('Produk tidak ditemukan')
  }
}
