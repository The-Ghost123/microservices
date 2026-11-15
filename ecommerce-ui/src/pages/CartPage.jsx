// src/pages/CartPage.jsx
// Halaman keranjang belanja SHOP tanpa fitur voucher promo.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCartDetail } from '../api/aggregate'
import { clearCart, removeCartItem, updateCartItem } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import { getProductImage } from '../data/defaultImages'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'
import { showToast } from '../utils/toast'

export default function CartPage({ userId }) {
  const navigate = useNavigate()
  const { loading, data, error, reload } = useAsync(() => getCartDetail(userId), [userId])
  const [actionError, setActionError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  async function run(action, itemId = null) {
    setActionError(null)
    if (itemId) setUpdatingId(itemId)
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err)
      showToast(describeError(err), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const rawTotal = data?.totalPrice || 0
  const totalItemCount =
    data?.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0

  return (
    <div className="cart-page-wrapper">
      <div className="cart-header-row">
        <div>
          <span className="section-eyebrow">KERANJANG BELANJA</span>
          <h1 className="page-title">Keranjang Belanja User #{userId}</h1>
        </div>
        <Link to="/" className="btn-continue-shopping">
          &larr; Lanjut Belanja Produk
        </Link>
      </div>

      {actionError && <div className="alert alert-error">{describeError(actionError)}</div>}

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && data.items.length === 0 ? (
          <div className="empty-cart-card">
            <span className="empty-cart-icon">🛒</span>
            <h2>Keranjang Belanja Anda Kosong</h2>
            <p>Anda belum menambahkan produk apa pun ke keranjang belanja User #{userId}.</p>
            <Link to="/" className="btn btn-primary btn-lg">
              Jelajahi Katalog Produk Sekarang
            </Link>
          </div>
        ) : null}

        {data && data.items.length > 0 && (
          <div className="cart-layout-grid">
            {/* Kolom Kiri: Tabel Item */}
            <div className="cart-items-column">
              <div className="cart-items-table-card">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th className="th-product">Produk</th>
                      <th className="th-price">Harga</th>
                      <th className="th-qty">Jumlah</th>
                      <th className="th-subtotal">Subtotal</th>
                      <th className="th-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => {
                      const isUpdating = updatingId === item.id
                      const product = item.product

                      return (
                        <tr key={item.id} className={isUpdating ? 'row-updating' : ''}>
                          <td className="td-product">
                            <div className="cart-product-cell">
                              <div className="cart-thumb-wrap">
                                <img
                                  src={getProductImage(product)}
                                  alt={product?.name || 'Produk'}
                                  className="cart-thumb"
                                />
                              </div>
                              <div className="cart-product-details">
                                <Link to={`/products/${item.product_id}`} className="cart-item-title">
                                  {product ? product.name : <em>Produk tidak tersedia</em>}
                                </Link>
                                <span className="cart-item-meta">
                                  {product?.category || 'Elektronik'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="td-price">
                            {product ? formatRupiah(product.price) : '-'}
                          </td>

                          <td className="td-qty">
                            <div className="cart-qty-stepper">
                              <button
                                type="button"
                                className="btn-qty-step"
                                aria-label="Kurangi jumlah"
                                disabled={item.quantity <= 1 || isUpdating}
                                onClick={() =>
                                  run(() => updateCartItem(item.id, item.quantity - 1), item.id)
                                }
                              >
                                -
                              </button>
                              <span className="qty-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="btn-qty-step"
                                aria-label="Tambah jumlah"
                                disabled={isUpdating}
                                onClick={() =>
                                  run(() => updateCartItem(item.id, item.quantity + 1), item.id)
                                }
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="td-subtotal">
                            <strong>
                              {product ? formatRupiah(Number(product.price) * item.quantity) : '-'}
                            </strong>
                          </td>

                          <td className="td-action">
                            <button
                              type="button"
                              className="btn-remove-item"
                              aria-label={`Hapus ${product?.name || 'item'}`}
                              disabled={isUpdating}
                              onClick={() => {
                                if (window.confirm('Hapus produk ini dari keranjang belanja?')) {
                                  run(() => removeCartItem(item.id), item.id)
                                }
                              }}
                              title="Hapus item"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Footer Tabel */}
                <div className="cart-table-footer">
                  <button
                    type="button"
                    className="btn-clear-cart"
                    onClick={() => {
                      if (window.confirm('Kosongkan seluruh isi keranjang belanja User ini?')) {
                        run(() => clearCart(userId))
                      }
                    }}
                  >
                    Kosongkan Keranjang
                  </button>

                  <span className="cart-protection-note">
                    🛡️ Seluruh produk bergaransi resmi 1 tahun.
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Belanja */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h3 className="summary-title">Ringkasan Belanja</h3>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Total Item ({totalItemCount} unit)</span>
                    <span>{formatRupiah(rawTotal)}</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row row-total">
                    <span>Total Pesanan</span>
                    <strong className="final-total-amount">{formatRupiah(rawTotal)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block btn-checkout"
                  onClick={() => navigate('/checkout')}
                >
                  Lanjut ke Checkout &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </AsyncView>
    </div>
  )
}
