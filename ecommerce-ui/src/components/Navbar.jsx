// src/components/Navbar.jsx
// Header navigasi SHOP, pemilih User ID, dan indikator keranjang belanja.

import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getCart } from '../api/cartApi'

const USERS = [1, 2, 3, 4, 5]

export default function Navbar({ userId, onUserChange, onOpenInfoModal }) {
  const [cartCount, setCartCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCartCount() {
      try {
        const cart = await getCart(userId)
        if (isMounted && cart && Array.isArray(cart.items)) {
          const count = cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
          setCartCount(count)
        }
      } catch {
        if (isMounted) setCartCount(0)
      }
    }

    loadCartCount()

    function handleCartUpdate() {
      loadCartCount()
    }

    window.addEventListener('shop_cart_updated', handleCartUpdate)
    return () => {
      isMounted = false
      window.removeEventListener('shop_cart_updated', handleCartUpdate)
    }
  }, [userId])

  return (
    <header className="navbar-container">
      <div className="navbar-main">
        {/* Logo & Brand */}
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-text">
            <span className="brand-name">E-SHOP</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-desktop">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Katalog Produk
          </NavLink>


          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Riwayat Pesanan
          </NavLink>
        </nav>

        {/* User Selector & Cart Action */}
        <div className="navbar-actions">
          {/* User Selector */}
          <div className="user-picker-badge" title="Ganti User ID untuk menguji isolasi keranjang belanja">
            <span className="user-icon">👤</span>
            <label htmlFor="user-select" className="user-label">
              User
            </label>
            <select
              id="user-select"
              value={userId}
              onChange={(e) => onUserChange(Number(e.target.value))}
              className="user-select"
            >
              {USERS.map((id) => (
                <option key={id} value={id}>
                  User #{id}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Button */}
          <Link to="/cart" className="btn-cart" aria-label="Keranjang Belanja">
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Keranjang</span>
            <span className={`cart-badge ${cartCount > 0 ? 'has-items' : ''}`}>
              {cartCount}
            </span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-hamburger"
            aria-label="Buka menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile">
          <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
            📦 Katalog Produk
          </NavLink>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenInfoModal && onOpenInfoModal('pengiriman')
            }}
          >
            🚚 Informasi Pengiriman
          </button>
          <button
            type="button"
            className="mobile-nav-link text-left"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenInfoModal && onOpenInfoModal('kebijakan')
            }}
          >
            🔄 Kebijakan Garansi & Retur
          </button>
          <NavLink to="/orders" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
            📋 Riwayat Pesanan
          </NavLink>
          <NavLink to="/cart" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
            🛒 Keranjang ({cartCount} item)
          </NavLink>
        </div>
      )}
    </header>
  )
}
