# app/routes/review_routes.py
# Hanya memetakan method dan path ke fungsi controller, tanpa logika apa pun.

from flask import Blueprint
from app.controllers import review_controller as controller

review_bp = Blueprint("reviews", __name__)

review_bp.add_url_rule(
    "/reviews/product/<int:product_id>",
    view_func=controller.list_by_product,
    methods=["GET"],
)
review_bp.add_url_rule(
    "/reviews/<review_id>", view_func=controller.show, methods=["GET"]
)
review_bp.add_url_rule(
    "/reviews", view_func=controller.store, methods=["POST"]
)
review_bp.add_url_rule(
    "/reviews/<review_id>", view_func=controller.update, methods=["PUT"]
)
review_bp.add_url_rule(
    "/reviews/<review_id>", view_func=controller.destroy, methods=["DELETE"]
)
