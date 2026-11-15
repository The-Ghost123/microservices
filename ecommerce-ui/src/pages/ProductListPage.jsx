// src/pages/ProductListPage.jsx
// Halaman utama katalog produk SHOP: Menampilkan produk yang ada di database.

import { useMemo, useRef, useState } from 'react'
import { getProductsWithRating } from '../api/aggregate'
import AsyncView from '../components/AsyncView'
import HeroBanner from '../components/HeroBanner'
import ProductCard from '../components/ProductCard'
import { PRODUCT_CATEGORIES } from '../data/products'
import { useAsync } from '../hooks/useAsync'

export default function ProductListPage({ userId }) {
  const { loading, data, error, reload } = useAsync(getProductsWithRating)
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const catalogRef = useRef(null)

  function scrollToCatalog() {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Filter & Urutkan Produk
  const filteredProducts = useMemo(() => {
    if (!data) return []

    let list = [...data]

    // Filter Kategori
    if (selectedCategory !== 'Semua') {
      list = list.filter((p) => {
        if (!p.category) return false
        return p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      })
    }

    // Filter Pencarian
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      )
    }

    // Pengurutan
    if (sortBy === 'price-low') {
      list.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating?.average_rating || 0) - (a.rating?.average_rating || 0))
    }

    return list
  }, [data, selectedCategory, searchQuery, sortBy])

  return (
    <div className="homepage-wrapper">
      {/* Hero Banner */}
      <HeroBanner onShopClick={scrollToCatalog} />

      {/* Katalog Produk Utama */}
      <section ref={catalogRef} id="katalog" className="catalog-section">
        <div className="catalog-header-wrap">
          <div>
            <span className="section-eyebrow">KATALOG SHOP</span>
            <h2 className="section-title">Produk Pilihan Kami</h2>
            <p className="section-subtitle">
              Pilihan perangkat keras berkualitas dengan performa andal dan garansi resmi.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="catalog-filters-bar">
            {/* Search Input */}
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="sort-box">
              <label htmlFor="sort-select" className="sort-label">
                Urutkan:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">Rekomendasi</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs" role="tablist">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <AsyncView loading={loading} error={error} onRetry={reload}>
          {filteredProducts.length === 0 ? (
            <div className="empty-catalog-state">
              <span className="empty-icon">📦</span>
              <h3>Tidak ada produk yang sesuai</h3>
              <p>Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCategory('Semua')
                  setSearchQuery('')
                }}
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} userId={userId} />
              ))}
            </div>
          )}
        </AsyncView>
      </section>
    </div>
  )
}
