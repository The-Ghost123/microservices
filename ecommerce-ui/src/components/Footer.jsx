// src/components/Footer.jsx
// Footer toko SHOP tanpa promo.

export default function Footer({ onOpenInfoModal }) {
  return (
    <footer className="footer-container">
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
