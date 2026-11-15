// src/pages/OrderHistoryPage.jsx
// Halaman riwayat pesanan SHOP untuk User ID aktif tanpa fitur pembayaran.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserOrders } from '../api/orderApi'
import { formatDateIndo, formatRupiah } from '../utils/format'

export default function OrderHistoryPage({ userId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadOrders() {
      setLoading(true)
      try {
        const data = await getUserOrders(userId)
        if (isMounted) setOrders(Array.isArray(data) ? data : [])
      } catch {
        if (isMounted) setOrders([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [userId])

  return (
    <div className="orders-page-wrapper">
      <div className="orders-header-row">
        <div>
          <span className="section-eyebrow">TRANSAKSI PENGGUNA</span>
          <h1 className="page-title">Riwayat Pesanan User #{userId}</h1>
          <p className="page-subtitle">
            Daftar pesanan yang dibuat oleh akun User #{userId}.
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          + Belanja Produk Lagi
        </Link>
      </div>

      {loading ? (
        <div className="order-loading-box">
          <span className="spinner-lg"></span>
          <p>Memuat riwayat pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-card">
          <span className="empty-orders-icon">📋</span>
          <h3>Belum Ada Pesanan untuk User #{userId}</h3>
          <p>Pesanan tersimpan secara terisolasi untuk tiap user ID.</p>
          <Link to="/" className="btn btn-primary">
            Mulai Belanja Produk Sekarang
          </Link>
        </div>
      ) : (
        <div className="orders-list-grid">
          {orders.map((ord) => {
            return (
              <div key={ord.id} className="order-history-card">
                <div className="order-history-top">
                  <div className="order-meta-info">
                    <span className="order-history-id">Pesanan #{ord.id}</span>
                    <span className="order-history-date">
                      {formatDateIndo(ord.created_at || new Date().toISOString())}
                    </span>
                  </div>
                  <span className="status-pill pill-confirmed">
                    ✓ {ord.status || 'TERKONFIRMASI'}
                  </span>
                </div>

                <div className="order-history-body">
                  <div className="order-history-amount">
                    <span>Total Transaksi:</span>
                    <strong>{formatRupiah(ord.total_amount || 0)}</strong>
                  </div>
                </div>

                <div className="order-history-actions">
                  <Link to={`/orders/${ord.id}`} className="btn btn-secondary btn-sm">
                    Lihat Rincian Pesanan
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
