// src/pages/ProductDetailPage.jsx
// Halaman detail produk SHOP: Gambar Base64, spesifikasi perangkat, ulasan, dan masukkan ke keranjang.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import ReviewForm from '../components/ReviewForm'
import StarRating from '../components/StarRating'
import {
  BASE64_HEADSET,
  BASE64_KEYBOARD,
  BASE64_MONITOR,
  BASE64_MOUSE,
  getProductImage,
} from '../data/defaultImages'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatDateIndo, formatRupiah } from '../utils/format'
import { showToast } from '../utils/toast'

export default function ProductDetailPage({ userId, onOpenInfoModal }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, data, error, reload } = useAsync(() => getProductDetail(id), [id])

  const [quantity, setQuantity] = useState('1')
  const [cartMessage, setCartMessage] = useState(null)
  const [adding, setAdding] = useState(false)

  async function handleAddToCart(shouldRedirect = false) {
    const amount = Math.max(1, Number(quantity) || 1)
    setAdding(true)
    setCartMessage(null)

    try {
      await addToCart(userId, Number(id), amount)
      showToast(`${amount}x "${data.product.name}" dimasukkan ke keranjang!`)
      setCartMessage({ type: 'success', text: `${amount}x produk berhasil ditambahkan ke keranjang.` })

      if (shouldRedirect) {
        navigate('/cart')
      }
    } catch (err) {
      const errMsg = describeError(err)
      setCartMessage({ type: 'error', text: errMsg })
      showToast(errMsg, 'error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="detail-page-wrapper">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">
          &larr; Kembali ke Katalog Produk
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{data?.product?.name || 'Detail Produk'}</span>
      </nav>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && data.product && (
          <>
            <div className="product-detail-grid">
              {/* Kolom Kiri: Gambar Produk Base64 */}
              <div className="detail-visual-col">
                <div className="detail-image-box">
                  <img
                    src={getProductImage(data.product)}
                    alt={data.product.name}
                    className="detail-main-img"
                    onError={(e) => {
                      const pid = Number(data.product?.id)
                      const pname = (data.product?.name || '').toLowerCase()
                      if (pid === 1 || pname.includes('keyboard')) e.target.src = BASE64_KEYBOARD
                      else if (pid === 2 || pname.includes('mouse')) e.target.src = BASE64_MOUSE
                      else if (pname.includes('monitor')) e.target.src = BASE64_MONITOR
                      else e.target.src = BASE64_HEADSET
                    }}
                  />
                </div>
              </div>

              {/* Kolom Kanan: Detail Informasi Produk */}
              <div className="detail-info-col">
                <div className="detail-header">
                  <div className="detail-tags">
                    <span className="badge-tag-category">{data.product.category || 'Perangkat'}</span>
                    <span className={`badge-tag-stock ${data.product.stock > 0 ? 'in' : 'out'}`}>
                      {data.product.stock > 0 ? `Stok Tersedia: ${data.product.stock} unit` : 'Stok Habis'}
                    </span>
                  </div>

                  <h1 className="detail-title">{data.product.name}</h1>

                  {/* Rating */}
                  <div className="detail-rating-wrap">
                    {data.reviews ? (
                      <StarRating
                        average={data.reviews.summary.average_rating}
                        total={data.reviews.summary.total_reviews}
                      />
                    ) : (
                      <span className="muted-text">Belum ada rating</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="detail-price-box">
                    <span className="current-price">{formatRupiah(data.product.price)}</span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="detail-description">
                  <h4 className="desc-heading">Deskripsi Produk:</h4>
                  <p>{data.product.description}</p>
                </div>

                {/* Spesifikasi Teknis */}
                {data.product.specs && data.product.specs.length > 0 && (
                  <div className="detail-specs-card">
                    <h4 className="specs-heading">Spesifikasi Produk:</h4>
                    <ul className="specs-list">
                      {data.product.specs.map((sp, idx) => (
                        <li key={idx}>
                          <strong>{sp.label}:</strong> {sp.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tombol Aksi Beli / Keranjang */}
                <div className="purchase-actions-box">
                  <div className="quantity-control-group">
                    <label htmlFor="detail-qty" className="qty-label">
                      Jumlah:
                    </label>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() => setQuantity((prev) => String(Math.max(1, (Number(prev) || 1) - 1)))}
                        disabled={Number(quantity) <= 1}
                        aria-label="Kurangi jumlah"
                      >
                        -
                      </button>
                      <input
                        id="detail-qty"
                        type="number"
                        min="1"
                        max={data.product.stock || 99}
                        value={quantity}
                        aria-label="Jumlah unit"
                        className="qty-input"
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-stepper"
                        onClick={() =>
                          setQuantity((prev) =>
                            String(Math.min(data.product.stock || 99, (Number(prev) || 1) + 1))
                          )
                        }
                        disabled={Number(quantity) >= (data.product.stock || 99)}
                        aria-label="Tambah jumlah"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="buttons-group">
                    <button
                      type="button"
                      className="btn btn-primary btn-add-cart"
                      onClick={() => handleAddToCart(false)}
                      disabled={adding || data.product.stock <= 0}
                    >
                      {adding ? 'Memasukkan...' : '🛒 Masukkan ke Keranjang'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-buy-now"
                      onClick={() => handleAddToCart(true)}
                      disabled={adding || data.product.stock <= 0}
                    >
                      ⚡ Beli Sekarang
                    </button>
                  </div>
                </div>

                {cartMessage && (
                  <div className={`alert alert-${cartMessage.type}`}>
                    <span>{cartMessage.text}</span>
                    {cartMessage.type === 'success' && (
                      <Link to="/cart" className="alert-link">
                        Lihat Keranjang &rarr;
                      </Link>
                    )}
                  </div>
                )}

                {/* Jaminan Produk */}
                <div className="trust-badges-grid">
                  <div
                    className="trust-badge-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenInfoModal && onOpenInfoModal('kebijakan')}
                  >
                    <span className="trust-icon">🛡️</span>
                    <div className="trust-text">
                      <strong>Garansi Resmi 1 Tahun</strong>
                      <p>Jaminan perlindungan servis suku cadang</p>
                    </div>
                  </div>
                  <div
                    className="trust-badge-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenInfoModal && onOpenInfoModal('pengiriman')}
                  >
                    <span className="trust-icon">🚚</span>
                    <div className="trust-text">
                      <strong>Pengiriman Aman</strong>
                      <p>Packing rapi dengan bubble wrap tebal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian Ulasan Pelanggan */}
            <section className="reviews-section">
              <div className="reviews-header">
                <div>
                  <span className="section-eyebrow">ULASAN PELANGGAN</span>
                  <h2 className="reviews-title">Pendapat Pengguna tentang Produk Ini</h2>
                </div>
                {data.reviews && (
                  <div className="reviews-summary-score">
                    <span className="big-rating">{data.reviews.summary.average_rating.toFixed(1)}</span>
                    <div>
                      <StarRating average={data.reviews.summary.average_rating} total={1} compact />
                      <p className="summary-count">Berdasarkan {data.reviews.summary.total_reviews} ulasan pembeli</p>
                    </div>
                  </div>
                )}
              </div>

              {data.reviews ? (
                <div className="reviews-layout">
                  <div className="reviews-list-col">
                    {data.reviews.reviews.length === 0 ? (
                      <p className="no-reviews-note">Belum ada ulasan untuk produk ini.</p>
                    ) : (
                      <div className="reviews-cards-list">
                        {data.reviews.reviews.map((review) => (
                          <article key={review.id} className="review-card">
                            <div className="review-card-top">
                              <div className="reviewer-info">
                                <span className="reviewer-avatar">U{review.user_id}</span>
                                <div>
                                  <strong className="reviewer-name">Pengguna #{review.user_id}</strong>
                                  <span className="verified-badge">✓ Pembeli Terverifikasi</span>
                                </div>
                              </div>
                              <span className="review-date">{formatDateIndo(review.created_at)}</span>
                            </div>
                            <div className="review-stars-row">
                              <StarRating average={review.rating} total={1} compact />
                            </div>
                            <p className="review-comment-text">
                              {review.comment || <em className="muted-text">Tanpa komentar</em>}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Tulis Ulasan */}
                  <div className="review-form-col">
                    <ReviewForm productId={Number(id)} userId={userId} onCreated={reload} />
                  </div>
                </div>
              ) : (
                <p className="alert alert-error">Data ulasan belum dapat dimuat saat ini.</p>
              )}
            </section>
          </>
        )}
      </AsyncView>
    </section>
  )
}
