// src/components/ProductCard.jsx
// Kartu produk SHOP dengan gambar Base64, animasi hover, dan tombol cepat keranjang.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../api/cartApi'
import { getProductImage } from '../data/defaultImages'
import { formatRupiah } from '../utils/format'
import { showToast } from '../utils/toast'
import StarRating from './StarRating'

export default function ProductCard({ product, userId }) {
  const { id, name, price, stock, rating, category } = product
  const [adding, setAdding] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imageSrc = imgError ? getProductImage({ id, name }) : getProductImage(product)

  async function handleQuickAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (adding) return

    setAdding(true)
    try {
      const targetUserId = userId || Number(localStorage.getItem('userId')) || 1
      await addToCart(targetUserId, Number(id), 1)
      showToast(`"${name}" berhasil ditambahkan ke keranjang!`)
    } catch {
      showToast('Gagal menambahkan ke keranjang', 'error')
    } finally {
      setTimeout(() => setAdding(false), 400)
    }
  }

  return (
    <article className="product-card">
      <Link to={`/products/${id}`} className="product-card-link">
        {/* Product Image Frame (Base64) */}
        <div className="product-image-container">
          <img
            src={imageSrc}
            alt={name}
            className="product-card-img"
            onError={() => setImgError(true)}
          />
          {category && <span className="product-category-badge">{category}</span>}
        </div>

        {/* Card Info */}
        <div className="product-card-body">
          <div className="product-card-meta">
            <span className={`product-stock-pill ${stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {stock > 0 ? `Stok: ${stock}` : 'Stok Habis'}
            </span>
          </div>

          <h3 className="product-card-title" title={name}>
            {name}
          </h3>

          <p className="product-card-desc">{product.description}</p>

          <div className="product-card-rating">
            {rating ? (
              <StarRating average={rating.average_rating} total={rating.total_reviews} compact />
            ) : (
              <span className="muted-text small">Belum ada ulasan</span>
            )}
          </div>

          <div className="product-card-bottom">
            <span className="product-card-price">{formatRupiah(price)}</span>

            <button
              type="button"
              className={`btn-quick-add ${adding ? 'btn-adding' : ''}`}
              onClick={handleQuickAdd}
              aria-label={`Tambah ${name} ke keranjang`}
              disabled={stock <= 0 || adding}
              title="Masukkan ke Keranjang"
            >
              {adding ? (
                <span className="spinner-mini"></span>
              ) : (
                <>
                  <span className="btn-icon">+</span>
                  <span className="btn-label-text">Keranjang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </article>
  )
}
