// src/components/HeroBanner.jsx
// Hero banner untuk toko SHOP.

export default function HeroBanner({ onShopClick }) {
  return (
    <section className="hero-banner hero-banner-shop">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-tag">SHOP E-COMMERCE</span>
        <h1 className="hero-title">PERANGKAT & AKSESORIS KOMPUTER</h1>
        <p className="hero-desc">
          Temukan produk perangkat keras dan aksesoris komputer berkualitas tinggi dengan spesifikasi terbaik dan
          garansi resmi untuk kebutuhan kerja maupun gaming Anda.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-hero" onClick={onShopClick}>
            Jelajahi Produk
          </button>
        </div>
      </div>
    </section>
  )
}
