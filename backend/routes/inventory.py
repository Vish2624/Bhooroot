from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import require_auth, require_role
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()


class StockUpdateBody(BaseModel):
    stock_quantity: Optional[int] = None
    reserved_quantity: Optional[int] = None
    operation: Optional[str] = None  # "add" | "subtract" | "set"
    amount: Optional[int] = None


# GET /api/inventory  (admin)
@router.get("/")
async def get_all_inventory(user: dict = Depends(require_role("admin"))):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    items = await db.inventory.find({"status": "active"}).sort("createdAt", -1).to_list(None)
    return {"success": True, "data": serialize_list(items)}


# GET /api/inventory/{product_id}
@router.get("/{product_id}")
async def get_product_inventory(product_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    item = await db.inventory.find_one({"product_id": product_id})
    if not item:
        raise HTTPException(404, "Inventory record not found")
    return {"success": True, "data": serialize_doc(item)}


# PATCH /api/inventory/{product_id}  (admin / vendor)
@router.patch("/{product_id}")
async def update_inventory(product_id: str, body: StockUpdateBody, user: dict = Depends(require_role("admin", "vendor"))):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    now = datetime.utcnow()

    existing = await db.inventory.find_one({"product_id": product_id})
    if not existing:
        raise HTTPException(404, "Inventory record not found")

    update = {"updatedAt": now, "last_restocked_at": now}

    if body.operation and body.amount is not None:
        current = existing.get("stock_quantity", 0)
        if body.operation == "add":
            update["stock_quantity"] = current + body.amount
        elif body.operation == "subtract":
            new_val = current - body.amount
            if new_val < 0:
                raise HTTPException(400, "Cannot subtract more than available stock")
            update["stock_quantity"] = new_val
        elif body.operation == "set":
            update["stock_quantity"] = body.amount
        else:
            raise HTTPException(400, "Invalid operation. Use: add, subtract, set")
    else:
        if body.stock_quantity is not None:
            update["stock_quantity"] = body.stock_quantity
        if body.reserved_quantity is not None:
            update["reserved_quantity"] = body.reserved_quantity

    # Sync inStock flag on product
    new_stock = update.get("stock_quantity", existing.get("stock_quantity", 0))
    await db.products.update_one(
        {"_id": to_oid(product_id)},
        {"$set": {"stock": new_stock, "inStock": new_stock > 0, "updatedAt": now}},
    )

    doc = await db.inventory.find_one_and_update(
        {"product_id": product_id},
        {"$set": update},
        return_document=True,
    )
    return {"success": True, "data": serialize_doc(doc)}


# POST /api/inventory  (admin — create inventory record manually)
@router.post("/")
async def create_inventory(
    product_id: str,
    stock_quantity: int = 0,
    user: dict = Depends(require_role("admin")),
):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    if not await db.products.find_one({"_id": to_oid(product_id)}):
        raise HTTPException(404, "Product not found")

    if await db.inventory.find_one({"product_id": product_id}):
        raise HTTPException(409, "Inventory record already exists for this product")

    now = datetime.utcnow()
    doc = {
        "product_id": product_id,
        "stock_quantity": stock_quantity,
        "reserved_quantity": 0,
        "last_restocked_at": now,
        "status": "active",
        "createdAt": now,
        "updatedAt": now,
        "createdby": user.get("email", ""),
    }
    result = await db.inventory.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "data": serialize_doc(doc)}
