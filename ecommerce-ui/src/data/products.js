// src/data/products.js
// Data produk resmi yang sudah ada di database sistem microservices:
// 1. Keyboard Mekanikal (Rp 500.000, stok 25)
// 2. Mouse Wireless (Rp 350.000, stok 10)
// 3. Headset Gaming (Rp 800.000, stok 15)
// Seluruh gambar menggunakan format Base64.

import { BASE64_HEADSET, BASE64_KEYBOARD, BASE64_MOUSE } from './defaultImages'

export const PRODUCT_CATEGORIES = ['Semua', 'Keyboard', 'Mouse', 'Audio & Headset']

export const EXISTING_PRODUCTS = [
  {
    id: 1,
    name: 'Keyboard Mekanikal',
    category: 'Keyboard',
    price: 500000,
    stock: 25,
    description: 'Keyboard mekanikal switch blue dengan tactile feedback yang responsif dan ketahanan tombol hingga 50 juta kali klik. Dilengkapi pencahayaan LED RGB dengan berbagai mode efek.',
    image: BASE64_KEYBOARD,
    specs: [
      { label: 'Tipe Switch', value: 'Blue Switch Mechanical (Tactile & Clicky)' },
      { label: 'Konektivitas', value: 'Kabel USB Type-C Detachable (Braided)' },
      { label: 'Keycaps', value: 'Double-Shot Injection ABS Anti-Fade' },
      { label: 'Anti-Ghosting', value: 'Full N-Key Rollover (NKRO)' },
      { label: 'Garansi', value: 'Garansi Resmi 1 Tahun' },
    ],
    rating: {
      average_rating: 4.9,
      total_reviews: 24,
    },
    reviews: [
      {
        id: 'r1',
        user_id: 2,
        rating: 5,
        comment: 'Switch blue-nya renyah banget dan feel mengetik jadi lebih mantap. Build quality kokoh!',
        created_at: '2026-11-05T10:15:00Z',
      },
      {
        id: 'r2',
        user_id: 3,
        rating: 5,
        comment: 'RGB-nya terang dan kabelnya braided tebal. Sangat puas dengan harga segini.',
        created_at: '2026-11-08T14:30:00Z',
      },
    ],
  },
  {
    id: 2,
    name: 'Mouse Wireless',
    category: 'Mouse',
    price: 350000,
    stock: 10,
    description: 'Mouse wireless dengan sensor optical presisi tinggi hingga 3200 DPI. Desain ergonomis yang nyaman digunakan untuk bekerja seharian maupun bermain game.',
    image: BASE64_MOUSE,
    specs: [
      { label: 'Sensor', value: 'High-Precision Optical Sensor (800 - 3200 DPI)' },
      { label: 'Konektivitas', value: 'Wireless 2.4 GHz Nano Receiver USB' },
      { label: 'Baterai', value: 'Rechargeable Li-Ion (Tahan hingga 40 jam)' },
      { label: 'Desain', value: 'Ergonomis Nyaman di Telapak Tangan' },
      { label: 'Garansi', value: 'Garansi Resmi 1 Tahun' },
    ],
    rating: {
      average_rating: 4.8,
      total_reviews: 18,
    },
    reviews: [
      {
        id: 'r3',
        user_id: 1,
        rating: 5,
        comment: 'Koneksi nirkabelnya stabil tanpa lag sama sekali. Baterai awet berhari-hari.',
        created_at: '2026-11-02T16:00:00Z',
      },
      {
        id: 'r4',
        user_id: 4,
        rating: 4,
        comment: 'Sensor optiknya akurat dan kliknya responsif. Bobotnya pas.',
        created_at: '2026-11-06T11:45:00Z',
      },
    ],
  },
  {
    id: 3,
    name: 'Headset Gaming',
    category: 'Audio & Headset',
    price: 800000,
    stock: 15,
    description: 'Headset gaming dengan kualitas audio terbaik, driver 50mm untuk surround sound 7.1 yang imersif, serta mikrofon noise-cancelling yang jernih.',
    image: BASE64_HEADSET,
    specs: [
      { label: 'Driver Unit', value: '50mm Neodymium Magnet Driver' },
      { label: 'Audio', value: 'Virtual 7.1 Surround Sound' },
      { label: 'Mikrofon', value: 'Fleksibel Noise-Cancelling Omnidirectional' },
      { label: 'Bahan Bantalan', value: 'Memory Foam Breathable Earpads' },
      { label: 'Garansi', value: 'Garansi Resmi 1 Tahun' },
    ],
    rating: {
      average_rating: 5.0,
      total_reviews: 31,
    },
    reviews: [
      {
        id: 'r5',
        user_id: 5,
        rating: 5,
        comment: 'Bass-nya dalam dan suara langkah kaki musuh terdengar jelas sekali di game. Busa kupingnya empuk!',
        created_at: '2026-11-10T13:20:00Z',
      },
    ],
  },
]

// Layanan Ekspedisi Pengiriman
export const SHIPPING_SERVICES = [
  {
    id: 'reguler',
    name: 'Pengiriman Reguler (2 - 3 Hari Kerja)',
    courier: 'JNE / J&T',
    cost: 20000,
  },
  {
    id: 'kilat',
    name: 'Pengiriman Kilat / Next Day (1 Hari Kerja)',
    courier: 'SiCepat BEST',
    cost: 35000,
  },
  {
    id: 'instant',
    name: 'Pengiriman Instan (Hari Ini Tiba)',
    courier: 'GoSend / GrabExpress',
    cost: 45000,
  },
]

// Kebijakan Pengembalian & Garansi
export const RETURN_POLICY = {
  title: 'Kebijakan Pengembalian & Garansi Produk',
  points: [
    {
      title: 'Garansi Resmi 1 Tahun',
      desc: 'Setiap produk elektronik (Keyboard, Mouse, Headset) dilindungi garansi servis dan suku cadang resmi selama 1 tahun penuh.',
    },
    {
      title: 'Tukar Unit Baru 7 Hari',
      desc: 'Jika barang yang diterima mengalami cacat pabrik atau rusak saat proses pengiriman, Anda berhak mendapatkan unit pengganti baru dalam 7 hari sejak barang diterima.',
    },
    {
      title: 'Syarat Klaim',
      desc: 'Wajib menyertakan bukti pembelian atau nomor pesanan serta video unboxing saat membuka paket pengiriman.',
    },
  ],
}
