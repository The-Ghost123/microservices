# app/services/review_service.py
# Lapisan service: tempat logika bisnis review.
# Dipanggil oleh controller, memakai model untuk mengakses data.
# Tidak mengenal request atau response HTTP sama sekali.

from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.clients import product_client
from app.exceptions import (
    DuplicateReviewError,
    ProductNotFoundError,
    ReviewNotFoundError,
)
from app.models import review_model


# Id dari URL berupa teks. Kalau bentuknya bukan ObjectId yang sah, anggap review-nya tidak ada.
def _parse_id(review_id):
    if not ObjectId.is_valid(review_id):
        raise ReviewNotFoundError(review_id)
    return ObjectId(review_id)


# Semua review satu produk beserta ringkasan ratingnya.
def get_product_reviews(product_id):
    return {
        "product_id": product_id,
        "summary": review_model.rating_summary(product_id),
        "reviews": review_model.find_by_product(product_id),
    }


def get_review(review_id):
    review = review_model.find_by_id(_parse_id(review_id))
    if review is None:
        raise ReviewNotFoundError(review_id)
    return review


# Buat review baru. Produknya diperiksa dulu ke product-service.
# Indeks unik di database yang menjaga satu user hanya satu review per produk,
# service cukup menerjemahkan kegagalannya menjadi exception yang bermakna.
def create_review(data):
    if not product_client.product_exists(data["product_id"]):
        raise ProductNotFoundError(data["product_id"])

    now = datetime.now(timezone.utc)
    document = {**data, "created_at": now, "updated_at": now}
    try:
        return review_model.insert(document)
    except DuplicateKeyError:
        raise DuplicateReviewError(data["user_id"], data["product_id"])


def update_review(review_id, data):
    fields = {**data, "updated_at": datetime.now(timezone.utc)}
    review = review_model.update(_parse_id(review_id), fields)
    if review is None:
        raise ReviewNotFoundError(review_id)
    return review


def delete_review(review_id):
    if not review_model.delete(_parse_id(review_id)):
        raise ReviewNotFoundError(review_id)
