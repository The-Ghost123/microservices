// src/pages/CheckoutPage.jsx
// Halaman Checkout SHOP: Informasi pengiriman dan konfirmasi pesanan (tanpa fitur pembayaran).

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCartDetail } from '../api/aggregate'
import { createOrder } from '../api/orderApi'
import { getProductImage } from '../data/defaultImages'
import { SHIPPING_SERVICES } from '../data/products'
import { formatRupiah } from '../utils/format'
import { showToast } from '../utils/toast'

export default function CheckoutPage({ userId }) {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loadingCart, setLoadingCart] = useState(true)

  // Form Pengiriman
  const [shippingForm, setShippingForm] = useState({
    fullName: 'Andi Pratama',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 45, RT 03 / RW 05',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    notes: 'Mohon kemas dengan bubble wrap tebal.',
  })

  // Kurir Pengiriman
  const [selectedCourier, setSelectedCourier] = useState(SHIPPING_SERVICES[0].id)
  const [agreePolicy, setAgreePolicy] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchCart() {
      try {
        const res = await getCartDetail(userId)
        if (isMounted) setCart(res)
      } catch {
        if (isMounted) setCart({ items: [], totalPrice: 0 })
      } finally {
        if (isMounted) setLoadingCart(false)
      }
    }
    fetchCart()
    return () => {
      isMounted = false
    }
  }, [userId])

  const courierObj = useMemo(() => {
    return SHIPPING_SERVICES.find((s) => s.id === selectedCourier) || SHIPPING_SERVICES[0]
  }, [selectedCourier])

  const subtotal = cart?.totalPrice || 0
  const shippingCost = courierObj.cost || 0
  const grandTotal = subtotal + shippingCost

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!agreePolicy) {
      showToast('Harap setujui ketentuan pemesanan', 'error')
      return
    }
    if (!cart || cart.items.length === 0) {
      showToast('Keranjang belanja Anda masih kosong', 'error')
      return
    }

    setSubmitting(true)

    try {
      const order = await createOrder(userId)

      const orderKey = `shop_order_meta_${order.id}`
      localStorage.setItem(
        orderKey,
        JSON.stringify({
          shipping: shippingForm,
          courier: courierObj,
          items: cart.items,
          subtotal,
          shippingCost,
          grandTotal,
        })
      )

      window.dispatchEvent(new Event('shop_cart_updated'))

      showToast(`Pesanan #${order.id} berhasil dikonfirmasi!`)
      navigate(`/orders/${order.id}`)
    } catch {
      showToast('Gagal memproses pesanan', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCart) {
    return (
      <div className="checkout-loading">
        <span className="spinner-lg"></span>
        <p>Menyiapkan rincian checkout...</p>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart-card">
        <span className="empty-cart-icon">🛒</span>
        <h2>Keranjang Belanja Masih Kosong</h2>
        <p>Silakan pilih produk terlebih dahulu sebelum melanjutkan ke checkout.</p>
        <Link to="/" className="btn btn-primary">
          Kembali ke Katalog
        </Link>
      </div>
    )
  }

  return (
    <div className="checkout-page-wrapper">
      {/* Step Indicator */}
      <div className="checkout-stepper">
        <div className="step-item step-completed">
          <span className="step-circle">✓</span>
          <span className="step-label">Keranjang</span>
        </div>
        <div className="step-line step-active"></div>
        <div className="step-item step-active">
          <span className="step-circle">2</span>
          <span className="step-label">Pengiriman</span>
        </div>
        <div className="step-line"></div>
        <div className="step-item">
          <span className="step-circle">3</span>
          <span className="step-label">Konfirmasi</span>
        </div>
      </div>

      <div className="checkout-layout-grid">
        {/* Kolom Kiri: Form Alamat & Pengiriman */}
        <form className="checkout-form-column" onSubmit={handlePlaceOrder}>
          {/* Section 1: Alamat Pengiriman */}
          <div className="checkout-section-card">
            <div className="section-title-wrap">
              <span className="section-badge-num">1</span>
              <div>
                <h3 className="section-card-title">Alamat Tujuan Pengiriman</h3>
                <p className="section-card-desc">Masukkan alamat lengkap tujuan pengiriman pesanan Anda.</p>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Nama Lengkap Penerima</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingForm.fullName}
                  onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={shippingForm.phone}
                  onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Lengkap</label>
              <textarea
                required
                rows="2"
                className="form-textarea"
                value={shippingForm.address}
                onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Kota / Kabupaten</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kode Pos</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingForm.postalCode}
                  onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan Pengiriman (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Titipkan pada satpam / depan pintu"
                value={shippingForm.notes}
                onChange={(e) => setShippingForm({ ...shippingForm, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Pilihan Kurir Ekspedisi */}
          <div className="checkout-section-card">
            <div className="section-title-wrap">
              <span className="section-badge-num">2</span>
              <div>
                <h3 className="section-card-title">Pilih Jasa Pengiriman</h3>
                <p className="section-card-desc">Pilihan kurir ekspedisi aman dan terpercaya.</p>
              </div>
            </div>

            <div className="couriers-options-grid">
              {SHIPPING_SERVICES.map((s) => (
                <label
                  key={s.id}
                  className={`courier-option-card ${selectedCourier === s.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="courier"
                    value={s.id}
                    checked={selectedCourier === s.id}
                    onChange={() => setSelectedCourier(s.id)}
                    className="sr-only"
                  />
                  <div className="courier-card-content">
                    <div className="courier-top-row">
                      <strong>{s.name}</strong>
                    </div>
                    <span className="courier-etd">Kurir: {s.courier}</span>
                    <strong className="courier-cost">{formatRupiah(s.cost)}</strong>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Ketentuan Pesanan */}
          <div className="checkout-policy-box">
            <div className="policy-box-header">
              <span className="policy-icon">🛡️</span>
              <div>
                <strong>Garansi Resmi & Kebijakan Toko</strong>
                <p>Seluruh produk bergaransi resmi 1 tahun dengan jaminan tukar baru 7 hari untuk cacat pabrik.</p>
              </div>
            </div>
            <label className="policy-checkbox-label">
              <input
                type="checkbox"
                checked={agreePolicy}
                onChange={(e) => setAgreePolicy(e.target.checked)}
              />
              <span>Saya menyetujui rincian pesanan dan alamat tujuan pengiriman yang tercantum.</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg btn-confirm-checkout"
            disabled={submitting || !agreePolicy}
          >
            {submitting ? 'Memproses Pesanan...' : `Konfirmasi & Buat Pesanan • ${formatRupiah(grandTotal)}`}
          </button>
        </form>

        {/* Kolom Kanan: Ringkasan Pesanan */}
        <aside className="checkout-summary-column">
          <div className="checkout-summary-card">
            <h3 className="summary-title">Ringkasan Pesanan</h3>

            <div className="checkout-items-list">
              {cart.items.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product?.name || 'Produk'}
                    className="checkout-item-thumb"
                  />
                  <div className="checkout-item-meta">
                    <span className="checkout-item-name">{item.product?.name || 'Produk'}</span>
                    <span className="checkout-item-qty">
                      {item.quantity} unit @ {item.product ? formatRupiah(item.product.price) : '-'}
                    </span>
                  </div>
                  <strong className="checkout-item-subtotal">
                    {item.product ? formatRupiah(Number(item.product.price) * item.quantity) : '-'}
                  </strong>
                </div>
              ))}
            </div>

            <div className="summary-calc-list">
              <div className="calc-row">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="calc-row">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(shippingCost)}</span>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-row total-highlight">
                <span>Total Pesanan</span>
                <strong className="calc-grand-total">{formatRupiah(grandTotal)}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
