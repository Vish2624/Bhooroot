from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import require_auth
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()


class ShippingAddress(BaseModel):
    name: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str


class OrderItem(BaseModel):
    product: str
    name: str
    image: Optional[str] = ""
    price: float
    unit: Optional[str] = ""
    quantity: int


class CreateOrderBody(BaseModel):
    items: List[OrderItem]
    shippingAddress: ShippingAddress
    paymentMethod: str
    subtotal: float
    shippingCost: Optional[float] = 0
    discount: Optional[float] = 0
    totalAmount: float
    promoCode: Optional[str] = ""


# POST /api/orders
@router.post("/")
async def create_order(body: CreateOrderBody, user: dict = Depends(require_auth)):
    if not body.items:
        raise HTTPException(400, "No items in order")

    order_number = "UM-" + str(int(datetime.utcnow().timestamp() * 1000))[-8:]

    if not is_connected():
        return {
            "success": True,
            "orderId": "demo_" + str(int(datetime.utcnow().timestamp())),
            "orderNumber": order_number,
            "message": "Order placed successfully (Demo Mode)",
            "data": {"orderNumber": order_number, "totalAmount": body.totalAmount, "itemsCount": len(body.items)},
        }

    db = get_db()
    now = datetime.utcnow()

    items_docs = []
    for item in body.items:
        try:
            pid = ObjectId(item.product)
        except Exception:
            pid = item.product
        items_docs.append({
            "product": pid,
            "name": item.name,
            "image": item.image,
            "price": item.price,
            "unit": item.unit,
            "quantity": item.quantity,
        })

    doc = {
        "user": to_oid(user["_id"]),
        "items": items_docs,
        "shippingAddress": body.shippingAddress.dict(),
        "paymentMethod": body.paymentMethod,
        "paymentStatus": "pending",
        "subtotal": body.subtotal,
        "shippingCost": body.shippingCost,
        "discount": body.discount,
        "totalAmount": body.totalAmount,
        "promoCode": body.promoCode or "",
        "orderStatus": "placed",
        "trackingId": "",
        "estimatedDelivery": "3–7 business days",
        "notes": "",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.orders.insert_one(doc)
    oid = result.inserted_id

    # Also write order_items records for reporting
    order_item_docs = [
        {
            "order_id":     str(oid),
            "product_id":   str(it["product"]),
            "product_name": it["name"],
            "price":        it["price"],
            "quantity":     it["quantity"],
            "status":       "active",
            "createdAt":    now,
            "updatedAt":    now,
            "createdby":    str(user["_id"]),
        }
        for it in items_docs
    ]
    if order_item_docs:
        await db.order_items.insert_many(order_item_docs)

    # Decrement product stock and inventory
    for item in body.items:
        try:
            pid = ObjectId(item.product)
            await db.products.update_one(
                {"_id": pid},
                {"$inc": {"stock": -item.quantity}},
            )
            await db.inventory.update_one(
                {"product_id": str(pid)},
                {"$inc": {"stock_quantity": -item.quantity}, "$set": {"updatedAt": now}},
            )
        except Exception:
            pass

    # Clear the user's cart for the products that were ordered
    ordered_pids = [item.product for item in body.items]
    await db.cart.delete_many({
        "user_id": str(user["_id"]),
        "product_id": {"$in": ordered_pids},
    })

    return {
        "success": True,
        "orderId": str(oid),
        "orderNumber": order_number,
        "message": "Order placed successfully",
        "data": serialize_doc(await db.orders.find_one({"_id": oid})),
    }


# GET /api/orders
@router.get("/")
async def list_orders(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    user: dict = Depends(require_auth),
):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    limit = min(limit, 50)
    filt: dict = {"user": to_oid(user["_id"])}
    if status:
        filt["orderStatus"] = status

    total = await db.orders.count_documents(filt)
    cursor = db.orders.find(filt).sort("createdAt", -1).skip((page - 1) * limit).limit(limit)
    orders = serialize_list(await cursor.to_list(length=limit))

    return {"success": True, "data": orders, "pagination": {"total": total, "page": page, "pages": -(-total // limit)}}


# GET /api/orders/:id
@router.get("/{order_id}")
async def get_order(order_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database not connected (Demo Mode)")

    db = get_db()
    order = await db.orders.find_one({"_id": to_oid(order_id)})
    if not order:
        raise HTTPException(404, "Order not found")

    if str(order["user"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(403, "Not authorised to view this order")

    return {"success": True, "data": serialize_doc(order)}


# PATCH /api/orders/:id/cancel
@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        return {"success": True, "message": "Order cancelled (Demo Mode)"}

    db = get_db()
    order = await db.orders.find_one({"_id": to_oid(order_id)})
    if not order:
        raise HTTPException(404, "Order not found")

    if str(order["user"]) != user["_id"] and user["role"] != "admin":
        raise HTTPException(403, "Not authorised")

    if order.get("orderStatus") not in ("placed", "confirmed"):
        raise HTTPException(400, f"Cannot cancel an order with status \"{order.get('orderStatus')}\"")

    await db.orders.update_one(
        {"_id": to_oid(order_id)},
        {"$set": {"orderStatus": "cancelled", "updatedAt": datetime.utcnow()}},
    )

    # Restore stock
    for item in order.get("items", []):
        try:
            await db.products.update_one(
                {"_id": item["product"]},
                {"$inc": {"stock": item["quantity"]}},
            )
        except Exception:
            pass

    updated = await db.orders.find_one({"_id": to_oid(order_id)})
    return {"success": True, "message": "Order cancelled successfully", "data": serialize_doc(updated)}


# PATCH /api/orders/:id/status
@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, body: dict, user: dict = Depends(require_auth)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin access required")

    valid = {"placed", "confirmed", "processing", "shipped", "delivered", "cancelled"}
    status = body.get("status")
    if not status or status not in valid:
        raise HTTPException(400, f"Status must be one of: {', '.join(valid)}")

    if not is_connected():
        return {"success": True, "message": f"Order status updated to \"{status}\" (Demo Mode)"}

    db = get_db()
    result = await db.orders.find_one_and_update(
        {"_id": to_oid(order_id)},
        {"$set": {"orderStatus": status, "updatedAt": datetime.utcnow()}},
        return_document=True,
    )
    if not result:
        raise HTTPException(404, "Order not found")

    return {"success": True, "message": f"Order status updated to \"{status}\"", "data": serialize_doc(result)}
