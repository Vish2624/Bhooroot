from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import require_auth
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()


class CartAddBody(BaseModel):
    product_id: str
    quantity: int = 1


class CartUpdateBody(BaseModel):
    quantity: int


# GET /api/cart
@router.get("/")
async def get_cart(user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]
    items = await db.cart.find({"user_id": uid, "status": "active"}).to_list(None)

    # Enrich with product info
    enriched = []
    for item in items:
        product = await db.products.find_one(
            {"_id": to_oid(item["product_id"])},
            {"name": 1, "price": 1, "image": 1, "inStock": 1, "unit": 1},
        )
        d = serialize_doc(item)
        d["product"] = serialize_doc(product) if product else None
        enriched.append(d)

    total = sum(
        (i.get("total_price") or 0)
        for i in enriched
        if i.get("product") and i["product"].get("inStock")
    )
    return {"success": True, "data": enriched, "cartTotal": total}


# POST /api/cart
@router.post("/")
async def add_to_cart(body: CartAddBody, user: dict = Depends(require_auth)):
    if body.quantity < 1:
        raise HTTPException(400, "Quantity must be at least 1")
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]
    now = datetime.utcnow()

    product = await db.products.find_one({"_id": to_oid(body.product_id)}, {"price": 1, "inStock": 1})
    if not product:
        raise HTTPException(404, "Product not found")
    if not product.get("inStock"):
        raise HTTPException(400, "Product is out of stock")

    price = product["price"]
    total_price = round(price * body.quantity, 2)

    existing = await db.cart.find_one({"user_id": uid, "product_id": body.product_id, "status": "active"})
    if existing:
        new_qty = existing["quantity"] + body.quantity
        await db.cart.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty, "total_price": round(price * new_qty, 2), "updatedAt": now}},
        )
        doc = await db.cart.find_one({"_id": existing["_id"]})
    else:
        doc = {
            "user_id": uid,
            "product_id": body.product_id,
            "quantity": body.quantity,
            "total_price": total_price,
            "status": "active",
            "createdAt": now,
            "updatedAt": now,
        }
        result = await db.cart.insert_one(doc)
        doc["_id"] = result.inserted_id

    return {"success": True, "message": "Item added to cart", "data": serialize_doc(doc)}


# PATCH /api/cart/{product_id}
@router.patch("/{product_id}")
async def update_cart_item(product_id: str, body: CartUpdateBody, user: dict = Depends(require_auth)):
    if body.quantity < 1:
        raise HTTPException(400, "Quantity must be at least 1")
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]

    item = await db.cart.find_one({"user_id": uid, "product_id": product_id, "status": "active"})
    if not item:
        raise HTTPException(404, "Cart item not found")

    product = await db.products.find_one({"_id": to_oid(product_id)}, {"price": 1})
    price = product["price"] if product else item.get("total_price", 0) / item["quantity"]

    doc = await db.cart.find_one_and_update(
        {"_id": item["_id"]},
        {"$set": {"quantity": body.quantity, "total_price": round(price * body.quantity, 2), "updatedAt": datetime.utcnow()}},
        return_document=True,
    )
    return {"success": True, "data": serialize_doc(doc)}


# DELETE /api/cart/{product_id}
@router.delete("/{product_id}")
async def remove_cart_item(product_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    result = await db.cart.delete_one({"user_id": user["_id"], "product_id": product_id, "status": "active"})
    if result.deleted_count == 0:
        raise HTTPException(404, "Cart item not found")
    return {"success": True, "message": "Item removed from cart"}


# DELETE /api/cart
@router.delete("/")
async def clear_cart(user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    await db.cart.delete_many({"user_id": user["_id"], "status": "active"})
    return {"success": True, "message": "Cart cleared"}
