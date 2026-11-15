// src/pages/OrderSuccessPage.jsx
// Halaman konfirmasi pesanan SHOP: Rincian pesanan dan status pengiriman tanpa fitur pembayaran.

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orderApi'
import { getProductImage } from '../data/defaultImages'
import { formatRupiah } from '../utils/format'

export default function OrderSuccessPage({ userId }) {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [orderMeta] = useState(() => {
    const rawMeta = localStorage.getItem(`shop_order_meta_${id}`)
    if (rawMeta) {
      try {
        return JSON.parse(rawMeta)
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchOrder() {
      try {
        const data = await getOrder(id)
        if (isMounted) setOrder(data)
      } catch {
        const local = JSON.parse(localStorage.getItem('shop_all_orders') || '[]')
        const found = local.find((o) => String(o.id) === String(id))
        if (isMounted && found) setOrder(found)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="order-loading-box">
        <span className="spinner-lg"></span>
        <p>Memuat informasi pesanan...</p>
      </div>
    )
  }

  const finalTotal = orderMeta?.grandTotal || order?.total_amount || 0

  return (
    <div className="order-success-page">
      {/* Success Hero */}
      <div className="order-status-banner banner-confirmed">
        <div className="order-status-icon">🎉</div>
        <h1 className="order-status-title">Pesanan Berhasil Dikonfirmasi!</h1>
        <p className="order-status-subtitle">
          Terima kasih atas pesanan Anda. Kami sedang memproses pengecekan unit dan pengemasan pesanan Anda.
        </p>
      </div>

      <div className="order-details-grid">
        {/* Kolom Kiri: Rincian Pesanan */}
        <div className="order-main-card">
          <div className="order-card-header">
            <div>
              <span className="order-id-label">NOMOR PESANAN</span>
              <h2 className="order-id-text">#{id}</h2>
            </div>
            <div className="order-status-pill-wrap">
              <span className="status-pill pill-confirmed">
                ✓ {order?.status || 'TERKONFIRMASI'}
              </span>
            </div>
          </div>

          <div className="order-confirmation-info-box">
            <h3 className="card-subheading">Status Pemrosesan</h3>
            <p>
              Pesanan untuk <strong>User #{userId}</strong> telah tercatat pada sistem.{' '}
              Tim gudang kami akan menyiapkan barang dan menyerahkannya kepada pihak ekspedisi.
            </p>
          </div>

          {/* Rincian Produk yang Dipesan */}
          <div className="order-items-snapshot-card">
            <h3 className="card-subheading">Daftar Produk Dipesan</h3>
            <div className="snapshot-items-list">
              {orderMeta?.items ? (
                orderMeta.items.map((item, idx) => (
                  <div key={idx} className="snapshot-item-row">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product?.name || 'Produk'}
                      className="snapshot-thumb"
                    />
                    <div className="snapshot-meta">
                      <strong>{item.product?.name || `Produk #${item.product_id}`}</strong>
                      <span className="small-text">
                        {item.quantity} unit @ {item.product ? formatRupiah(item.product.price) : '-'}
                      </span>
                    </div>
                    <strong className="snapshot-price">
                      {item.product ? formatRupiah(Number(item.product.price) * item.quantity) : '-'}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="muted-text">Informasi produk tersimpan di database sistem.</p>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rincian Pengiriman */}
        <aside className="order-sidebar-col">
          <div className="order-shipping-summary-card">
            <h3 className="summary-title">Tujuan Pengiriman</h3>
            {orderMeta?.shipping ? (
              <div className="shipping-address-block">
                <strong>{orderMeta.shipping.fullName}</strong>
                <p>{orderMeta.shipping.phone}</p>
                <p>{orderMeta.shipping.address}</p>
                <p>
                  {orderMeta.shipping.city}, {orderMeta.shipping.postalCode}
                </p>
                {orderMeta.shipping.notes && (
                  <p className="delivery-notes">
                    <em>Catatan: &ldquo;{orderMeta.shipping.notes}&rdquo;</em>
                  </p>
                )}
                <div className="courier-chosen-badge">
                  <span>Jasa Kirim:</span> <strong>{orderMeta.courier?.name}</strong>
                </div>
              </div>
            ) : (
              <p className="muted-text">Pengiriman untuk User #{userId}.</p>
            )}

            <div className="summary-calc-list" style={{ marginTop: '1rem' }}>
              <div className="calc-row">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(orderMeta?.subtotal || order?.total_amount || 0)}</span>
              </div>
              <div className="calc-row">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(orderMeta?.shippingCost || 0)}</span>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-row total-highlight">
                <span>Total Pesanan</span>
                <strong className="calc-grand-total">{formatRupiah(finalTotal)}</strong>
              </div>
            </div>

            <div className="action-buttons-stack">
              <Link to="/orders" className="btn btn-secondary btn-block">
                📋 Lihat Riwayat Pesanan
              </Link>
              <Link to="/" className="btn btn-outline btn-block">
                📦 Kembali ke Katalog Produk
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
