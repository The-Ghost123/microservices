# app/clients/product_client.py
# Klien HTTP untuk berbicara dengan product-service. Satu-satunya tempat yang tahu alamat
# dan cara memanggil service itu, lapisan lain cukup memakai fungsi product_exists().

import os
import requests
from app.exceptions import ProductServiceUnavailableError

# Batas waktu menunggu jawaban. Tanpa batas ini, product-service yang macet
# akan membuat request ke review-service ikut menggantung.
TIMEOUT_SECONDS = 3


# True kalau produk ada, False kalau product-service membalas 404.
# Kalau service tidak bisa dijangkau atau membalas error lain, lempar ProductServiceUnavailableError.
def product_exists(product_id):
    # Alamat dibaca saat fungsi dipanggil, bukan saat file di-import,
    # supaya nilai dari .env sudah terbaca oleh load_dotenv().
    base_url = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:3000")

    try:
        response = requests.get(
            f"{base_url}/products/{product_id}", timeout=TIMEOUT_SECONDS
        )
    except requests.RequestException as error:
        # Mencakup koneksi ditolak, DNS gagal, dan timeout.
        raise ProductServiceUnavailableError(
            "Product service tidak dapat dihubungi"
        ) from error

    if response.status_code == 404:
        return False
    if not response.ok:
        raise ProductServiceUnavailableError(
            f"Product service membalas error {response.status_code}"
        )

    return True
