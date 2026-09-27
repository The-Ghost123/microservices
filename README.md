# Product Service — Microservice API

REST API untuk manajemen produk menggunakan Node.js + Express + MySQL, siap dijalankan via Docker.

## Struktur Proyek

```
product-service/
├── config/
│   └── db.js                 # Konfigurasi koneksi MySQL (pool)
├── controllers/
│   └── productController.js  # Handler untuk setiap endpoint
├── models/
│   └── productModel.js       # Query database
├── routes/
│   └── productRoutes.js      # Definisi route CRUD
├── database/
│   └── init.sql              # Skema tabel & data awal
├── app.js                    # Setup Express
├── server.js                 # Entry point
├── Dockerfile                # Konfigurasi image Docker
├── .env                      # Environment variables (lokal)
└── .env.example              # Template environment variables
```

## Menjalankan dengan Docker

### Prasyarat
- Docker Desktop sudah terinstal dan berjalan

### Langkah

```bash
# Dari root folder microservices/
docker compose up --build -d
```

Service akan tersedia di `http://localhost:3000`

### Menghentikan service

```bash
docker compose down
```

### Menghentikan dan menghapus data volume

```bash
docker compose down -v
```

---

## API Endpoints

Base URL: `http://localhost:3000`

### Health Check

| Method | Endpoint  | Deskripsi       |
|--------|-----------|-----------------|
| GET    | `/health` | Status service  |

**Response:**
```json
{ "status": "ok", "service": "product-service" }
```

---

### Products

| Method | Endpoint          | Deskripsi                   |
|--------|-------------------|-----------------------------|
| GET    | `/products`       | Ambil semua produk          |
| GET    | `/products/:id`   | Ambil produk berdasarkan ID |
| POST   | `/products`       | Buat produk baru            |
| PUT    | `/products/:id`   | Update produk               |
| DELETE | `/products/:id`   | Hapus produk                |

---

#### GET /products

```bash
curl http://localhost:3000/products
```

**Response 200:**
```json
{
  "message": "Berhasil mengambil data produk",
  "data": [
    { "id": 1, "name": "Keyboard Mekanikal", "price": "500000.00", "description": "...", "stock": 25, "created_at": "..." }
  ]
}
```

---

#### GET /products/:id

```bash
curl http://localhost:3000/products/1
```

**Response 200:**
```json
{
  "message": "Berhasil mengambil data produk",
  "data": { "id": 1, "name": "Keyboard Mekanikal", ... }
}
```

**Response 404:**
```json
{ "message": "Produk tidak ditemukan" }
```

---

#### POST /products

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Monitor 24 inch", "description": "Monitor IPS Full HD", "price": 2500000, "stock": 5}'
```

**Body (JSON):**
| Field       | Type    | Required | Keterangan          |
|-------------|---------|----------|---------------------|
| name        | string  | ✅        | Nama produk         |
| price       | number  | ✅        | Harga produk        |
| description | string  | ❌        | Deskripsi produk    |
| stock       | number  | ❌        | Jumlah stok (default: 0) |

**Response 201:**
```json
{
  "message": "Produk berhasil dibuat",
  "data": { "id": 4, "name": "Monitor 24 inch", ... }
}
```

---

#### PUT /products/:id

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Keyboard Mekanikal RGB", "price": 650000, "stock": 20}'
```

**Response 200:**
```json
{
  "message": "Produk berhasil diperbarui",
  "data": { "id": 1, "name": "Keyboard Mekanikal RGB", ... }
}
```

---

#### DELETE /products/:id

```bash
curl -X DELETE http://localhost:3000/products/1
```

**Response 200:**
```json
{ "message": "Produk berhasil dihapus" }
```

---

## Environment Variables

| Variable    | Default     | Keterangan         |
|-------------|-------------|--------------------|
| PORT        | 3000        | Port aplikasi      |
| DB_HOST     | product-db  | Host MySQL         |
| DB_USER     | appuser     | Username MySQL     |
| DB_PASSWORD | apppassword | Password MySQL     |
| DB_NAME     | productdb   | Nama database      |
