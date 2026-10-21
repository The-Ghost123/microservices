# app/schemas/review_schema.py
# Lapisan validasi request: memeriksa data kiriman client sebelum masuk ke service.
# Kalau ada yang salah, dilempar ValidationError berisi semua kesalahannya sekaligus.

from app.exceptions import ValidationError

MAX_COMMENT_LENGTH = 1000


# Di Python, True dan False ternyata turunan int, jadi harus dikecualikan secara eksplisit.
def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _rating_error(value):
    if not _is_int(value) or not 1 <= value <= 5:
        return "Field rating harus berupa angka bulat antara 1 sampai 5"
    return None


def _comment_error(value):
    if not isinstance(value, str):
        return "Field comment harus berupa teks"
    if len(value) > MAX_COMMENT_LENGTH:
        return f"Field comment maksimal {MAX_COMMENT_LENGTH} karakter"
    return None


# Aturan untuk POST /reviews. Balikin data bersih yang siap dipakai service.
def validate_create_review(payload):
    if not isinstance(payload, dict):
        raise ValidationError({"body": ["Body request harus berupa JSON object"]})

    errors = {}
    for field in ("product_id", "user_id"):
        value = payload.get(field)
        if value is None:
            errors[field] = [f"Field {field} wajib diisi"]
        elif not _is_int(value) or value < 1:
            errors[field] = [f"Field {field} harus berupa angka bulat minimal 1"]

    if payload.get("rating") is None:
        errors["rating"] = ["Field rating wajib diisi"]
    elif _rating_error(payload["rating"]):
        errors["rating"] = [_rating_error(payload["rating"])]

    comment = payload.get("comment", "")
    if _comment_error(comment):
        errors["comment"] = [_comment_error(comment)]

    if errors:
        raise ValidationError(errors)

    return {
        "product_id": payload["product_id"],
        "user_id": payload["user_id"],
        "rating": payload["rating"],
        "comment": comment,
    }


# Aturan untuk PUT /reviews/<id>. Hanya rating dan comment yang boleh diubah,
# dan minimal salah satunya harus dikirim.
def validate_update_review(payload):
    if not isinstance(payload, dict):
        raise ValidationError({"body": ["Body request harus berupa JSON object"]})

    errors = {}
    data = {}

    if "rating" not in payload and "comment" not in payload:
        errors["body"] = ["Kirim minimal salah satu dari rating atau comment"]

    if "rating" in payload:
        if _rating_error(payload["rating"]):
            errors["rating"] = [_rating_error(payload["rating"])]
        else:
            data["rating"] = payload["rating"]

    if "comment" in payload:
        if _comment_error(payload["comment"]):
            errors["comment"] = [_comment_error(payload["comment"])]
        else:
            data["comment"] = payload["comment"]

    if errors:
        raise ValidationError(errors)

    return data
