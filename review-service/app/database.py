# app/database.py
# Menyiapkan koneksi ke MongoDB sekali saat aplikasi mulai, lalu menyediakan collection
# reviews untuk lapisan model. Indeks juga dibuat di sini supaya otomatis ada di database baru.

import os
from pymongo import ASCENDING, MongoClient

_db = None


def init_db():
    global _db

    # tz_aware=True membuat waktu dari MongoDB berzona UTC, bukan waktu polos tanpa zona.
    # serverSelectionTimeoutMS membatasi lama menunggu server,
    # supaya error cepat muncul kalau MongoDB mati.
    client = MongoClient(
        os.getenv("MONGO_URI", "mongodb://localhost:27017"),
        tz_aware=True,
        serverSelectionTimeoutMS=3000,
    )
    _db = client[os.getenv("MONGO_DB_NAME", "reviewdb")]

    reviews = _db["reviews"]

    # Satu user hanya boleh mengulas satu produk satu kali.
    reviews.create_index(
        [("user_id", ASCENDING), ("product_id", ASCENDING)],
        unique=True,
    )
    # Mempercepat pencarian semua review milik satu produk.
    reviews.create_index("product_id")


def get_collection():
    if _db is None:
        raise RuntimeError("Database belum diinisialisasi, panggil init_db() lebih dulu")
    return _db["reviews"]
