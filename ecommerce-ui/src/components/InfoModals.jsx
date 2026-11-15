// src/components/InfoModals.jsx
// Modal informasi untuk Kebijakan Garansi & Retur, Pengiriman, dan Tentang SHOP.

import { useEffect } from 'react'
import { RETURN_POLICY, SHIPPING_SERVICES } from '../data/products'
import { formatRupiah } from '../utils/format'

export default function InfoModals({ activeModal, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeModal, onClose])

  if (!activeModal) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup modal">
          ✕
        </button>

        {activeModal === 'kebijakan' && (
          <div className="modal-content">
            <span className="badge badge-accent">Garansi Resmi</span>
            <h2>{RETURN_POLICY.title}</h2>
            <div className="modal-sections">
              {RETURN_POLICY.points.map((pt, idx) => (
                <div key={idx} className="info-block">
                  <h4>
                    <span className="info-num">{idx + 1}</span> {pt.title}
                  </h4>
                  <p>{pt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModal === 'pengiriman' && (
          <div className="modal-content">
            <span className="badge badge-primary">Logistik & Ekspedisi</span>
            <h2>Informasi Pengiriman</h2>
            <p className="modal-lead">
              Seluruh pesanan dikemas dengan bubble wrap tebal dan kardus pelindung demi menjamin keamanan perangkat
              elektronik hingga ke tangan Anda.
            </p>

            <div className="grid-cards-mini">
              {SHIPPING_SERVICES.map((ship) => (
                <div key={ship.id} className="mini-card">
                  <div className="mini-card-header">
                    <strong>{ship.name}</strong>
                    <span className="badge-tag">{formatRupiah(ship.cost)}</span>
                  </div>
                  <p className="small-text">Mitra Kurir: {ship.courier}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeModal === 'tentang' && (
          <div className="modal-content">
            <span className="badge badge-accent">Profil Toko</span>
            <h2>Tentang SHOP</h2>
            <p className="modal-lead">
              SHOP adalah platform toko online terpercaya yang menyediakan berbagai kebutuhan perangkat keras dan
              aksesoris komputer orisinal dengan garansi resmi.
            </p>
            <div className="callout callout-info" style={{ marginTop: '1.5rem' }}>
              <strong>Tugas Perkuliahan Microservices:</strong> Frontend ini terintegrasi dengan arsitektur microservices
              (Product Service, Cart Service, Review Service, dan Order Service).
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
