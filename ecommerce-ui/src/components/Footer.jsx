// src/components/Footer.jsx
// Footer toko SHOP tanpa promo.

export default function Footer({ onOpenInfoModal }) {
  return (
    <footer className="footer-container">
      <div className="footer-top">
        {/* Brand Description */}
        <div className="footer-col footer-col-wide">
          <h3 className="footer-heading">SHOP</h3>
          <p className="footer-desc">
            Pusat belanja perangkat keras dan aksesoris komputer berkualitas tinggi dengan garansi resmi dan layanan
            terpercaya.
          </p>
        </div>

        {/* SHOP Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">INFORMASI</h4>
          <ul className="footer-links">
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenInfoModal('tentang')}>
                Tentang Kami
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenInfoModal('kebijakan')}>
                Kebijakan Garansi & Retur
              </button>
            </li>
            <li>
              <button type="button" className="footer-link-btn" onClick={() => onOpenInfoModal('pengiriman')}>
                Informasi Pengiriman
              </button>
            </li>
          </ul>
        </div>

        {/* Bantuan & Kontak */}
        <div className="footer-col">
          <h4 className="footer-col-title">BANTUAN</h4>
          <div className="footer-contact-item">
            <span className="contact-icon">✉️</span>
            <span className="contact-text">halo@shop.id</span>
          </div>
          <div className="footer-contact-item">
            <span className="contact-icon">💬</span>
            <span className="contact-text">+62 812-3456-7890</span>
          </div>
          <p className="footer-support-hours">
            Layanan Pelanggan:
            <br />
            Senin – Sabtu, 08.00 – 17.00 WIB
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} <strong>SHOP</strong> • Seluruh hak cipta dilindungi.
        </p>
        <div className="footer-tags">
          <span className="demo-tag">Tugas Perkuliahan Microservices</span>
        </div>
      </div>
    </footer>
  )
}
