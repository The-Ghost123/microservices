// src/components/AsyncView.jsx
// Menampilkan status memuat dengan skeleton elegan atau kotak pesan error dengan tombol coba lagi.

export default function AsyncView({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="skeleton-card">
            <div className="skeleton-img shimmer"></div>
            <div className="skeleton-text-group">
              <div className="skeleton-line shimmer" style={{ width: '40%' }}></div>
              <div className="skeleton-line shimmer" style={{ width: '80%', height: '1.2rem' }}></div>
              <div className="skeleton-line shimmer" style={{ width: '50%' }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-card">
        <span className="error-icon">⚠️</span>
        <h3>Terjadi Kendala Memuat Data</h3>
        <p className="error-message">{error.message || 'Tidak dapat terhubung ke server saat ini.'}</p>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Coba Muat Ulang
        </button>
      </div>
    )
  }

  return children
}
