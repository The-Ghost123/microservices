# app/exceptions.py
# Exception khusus untuk masalah yang sudah kita duga. Service melempar, controller menangkap
# lalu menentukan status response-nya. Dengan begitu service tidak perlu tahu soal HTTP.


class ValidationError(Exception):
    # Dilempar oleh schema kalau data yang dikirim client tidak valid.
    def __init__(self, errors):
        super().__init__("Data yang dikirim tidak valid")
        self.errors = errors  # dict: nama field -> daftar pesan kesalahan


class ReviewNotFoundError(Exception):
    def __init__(self, review_id):
        super().__init__(f"Review dengan id {review_id} tidak ditemukan")


class DuplicateReviewError(Exception):
    def __init__(self, user_id, product_id):
        super().__init__(f"User {user_id} sudah pernah mengulas produk {product_id}")


class ProductNotFoundError(Exception):
    # Dilempar kalau product_id yang dikirim tidak ada di product-service.
    def __init__(self, product_id):
        super().__init__(f"Produk dengan id {product_id} tidak ditemukan")


class ProductServiceUnavailableError(Exception):
    # Dilempar kalau product-service tidak bisa dijangkau atau membalas error.
    pass
