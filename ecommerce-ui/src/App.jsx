// src/App.jsx
// Kerangka aplikasi utama POSTERKU: Navigasi, pemilih user ID, modal informasi, rute halaman, dan notifikasi toast.

import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import InfoModals from './components/InfoModals'
import Navbar from './components/Navbar'
import ToastContainer from './components/Toast'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'

export default function App() {
  // User aktif disimpan di localStorage agar status user tidak hilang saat refresh
  const [userId, setUserId] = useState(() => Number(localStorage.getItem('userId')) || 1)
  const [activeModal, setActiveModal] = useState(null)

  function changeUser(value) {
    setUserId(value)
    localStorage.setItem('userId', String(value))
    // Trigger event agar semua komponen yang bergantung pada keranjang user ter-update
    window.dispatchEvent(new Event('shop_cart_updated'))
  }

  function handleOpenModal(modalName) {
    setActiveModal(modalName)
  }

  function handleCloseModal() {
    setActiveModal(null)
  }

  return (
    <div className="app-root">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Info Modals (Kebijakan, Pembayaran, Tentang) */}
      <InfoModals activeModal={activeModal} onClose={handleCloseModal} />

      {/* Header & Navbar */}
      <Navbar
        userId={userId}
        onUserChange={changeUser}
        onOpenInfoModal={handleOpenModal}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<ProductListPage userId={userId} onOpenInfoModal={handleOpenModal} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailPage userId={userId} onOpenInfoModal={handleOpenModal} />}
          />
          <Route
            path="/cart"
            element={<CartPage userId={userId} onOpenInfoModal={handleOpenModal} />}
          />
          <Route
            path="/checkout"
            element={<CheckoutPage userId={userId} onOpenInfoModal={handleOpenModal} />}
          />
          <Route
            path="/orders"
            element={<OrderHistoryPage userId={userId} />}
          />
          <Route
            path="/orders/:id"
            element={<OrderSuccessPage userId={userId} />}
          />
          <Route
            path="*"
            element={
              <div className="container not-found-card">
                <h2>Halaman Tidak Ditemukan</h2>
                <p>Halaman yang Anda cari tidak tersedia atau alamat telah berubah.</p>
                <Link to="/" className="btn btn-primary">
                  Kembali ke Beranda
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onOpenInfoModal={handleOpenModal} />
    </div>
  )
}
