# app/controllers/review_controller.py
# Lapisan controller: memvalidasi input, memanggil service, membentuk response JSON,
# dan menangkap error lewat try except. Tidak ada query atau aturan bisnis di sini.

import traceback
from flask import current_app, jsonify, request

from app.exceptions import (
    DuplicateReviewError,
    ProductNotFoundError,
    ProductServiceUnavailableError,
    ReviewNotFoundError,
    ValidationError,
)
from app.schemas.review_schema import (
    validate_create_review,
    validate_update_review,
)
from app.services import review_service


# GET /reviews/product/<product_id>
def list_by_product(product_id):
    try:
        data = review_service.get_product_reviews(product_id)
        return jsonify(
            {"message": "Berhasil mengambil review produk", "data": data}
        )
    except Exception as error:
        return _error_response(error, "mengambil review produk")


# GET /reviews/<review_id>
def show(review_id):
    try:
        review = review_service.get_review(review_id)
        return jsonify(
            {"message": "Berhasil mengambil review", "data": review}
        )
    except ReviewNotFoundError as error:
        return jsonify({"message": str(error)}), 404
    except Exception as error:
        return _error_response(error, "mengambil review")


# POST /reviews
def store():
    try:
        # silent=True: kalau body bukan JSON yang sah, hasilnya None dan ditolak oleh validasi.
        data = validate_create_review(request.get_json(silent=True))
        review = review_service.create_review(data)
        return (
            jsonify({"message": "Review berhasil dibuat", "data": review}),
            201,
        )
    except ValidationError as error:
        return _validation_response(error)
    except ProductNotFoundError as error:
        # Produk yang diulas tidak ada di product-service: diperlakukan sebagai data tidak valid.
        return (
            jsonify(
                {
                    "message": "Data yang dikirim tidak valid",
                    "errors": {"product_id": [str(error)]},
                }
            ),
            422,
        )
    except ProductServiceUnavailableError as error:
        return _unavailable_response(error)
    except DuplicateReviewError as error:
        return jsonify({"message": str(error)}), 409
    except Exception as error:
        return _error_response(error, "membuat review")


# PUT /reviews/<review_id>
def update(review_id):
    try:
        data = validate_update_review(request.get_json(silent=True))
        review = review_service.update_review(review_id, data)
        return jsonify(
            {"message": "Review berhasil diperbarui", "data": review}
        )
    except ValidationError as error:
        return _validation_response(error)
    except ReviewNotFoundError as error:
        return jsonify({"message": str(error)}), 404
    except Exception as error:
        return _error_response(error, "memperbarui review")


# DELETE /reviews/<review_id>
def destroy(review_id):
    try:
        review_service.delete_review(review_id)
        return jsonify({"message": "Review berhasil dihapus"})
    except ReviewNotFoundError as error:
        return jsonify({"message": str(error)}), 404
    except Exception as error:
        return _error_response(error, "menghapus review")


# 422: data dari client tidak valid, sertakan detail kesalahan per field.
def _validation_response(error):
    return jsonify({"message": str(error), "errors": error.errors}), 422


# 503: review-service sehat, tetapi product-service yang dibutuhkannya sedang bermasalah.
# Ini bukan salah client dan bukan bug di service ini, jadi dicatat sebagai peringatan.
def _unavailable_response(error):
    current_app.logger.warning(
        "Product service bermasalah: %s (penyebab: %s)", error, error.__cause__
    )
    body = {
        "message": "Product service tidak dapat dihubungi, coba lagi nanti"
    }
    if current_app.debug:
        body["error"] = str(error)
        body["cause"] = str(error.__cause__) if error.__cause__ else None
    return jsonify(body), 503


# Satu tempat untuk menangani error tak terduga, dipanggil dari blok except di atas.
def _error_response(error, action):
    # logger.exception mencatat pesan beserta traceback lengkap. Inilah bahan utama debugging.
    current_app.logger.exception("Gagal %s", action)
    body = {"message": f"Gagal {action}"}
    # Detail error hanya dikirim ke client saat mode debug aktif, supaya tidak bocor di production.
    if current_app.debug:
        frame = traceback.extract_tb(error.__traceback__)[-1]
        body["error"] = str(error)
        body["location"] = f"{frame.filename}:{frame.lineno}"
    return jsonify(body), 500
