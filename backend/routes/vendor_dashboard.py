from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from config.database import get_db, is_connected
from middleware.auth import require_role
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()
_vendor = require_role("vendor")


def _db_guard():
    if not is_connected():
        raise HTTPException(503, "Database not connected (Demo Mode)")


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def vendor_stats(user: dict = Depends(_vendor)):
    _db_guard()
    db = get_db()
    vid = to_oid(user["_id"])

    import asyncio
    (total_products, active_products, pending_products, out_of_stock,
     total_orders, delivered_orders) = await asyncio.gather(
        db.products.count_documents({"vendor": vid}),
        db.products.count_documents({"vendor": vid, "approvalStatus": "approved", "inStock": True}),
        db.products.count_documents({"vendor": vid, "approvalStatus": "submitted"}),
        db.products.count_documents({"vendor": vid, "inStock": False}),
        db.orders.count_documents({}),
        db.orders.count_documents({"orderStatus": "delivered"}),
    )

    pending_orders = await db.orders.count_documents({"orderStatus": "placed"})

    revenue_agg = await db.orders.aggregate([
        {"$match": {"paymentStatus": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}},
    ]).to_list(length=1)
    total_revenue = revenue_agg[0]["total"] if revenue_agg else 0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_sales = await db.orders.count_documents({"createdAt": {"$gte": today_start}})

    return {"success": True, "data": {
        "totalProducts": total_products, "activeProducts": active_products,
        "pendingProducts": pending_products, "outOfStock": out_of_stock,
        "totalOrders": total_orders, "pendingOrders": pending_orders,
        "deliveredOrders": delivered_orders, "totalRevenue": total_revenue, "todaySales": today_sales,
    }}


# ── Product Management ───────────────────────────────────────────────────────

@router.get("/products")
async def list_vendor_products(
    search: Optional[str] = None, status: Optional[str] = None,
    page: int = 1, limit: int = 20, user: dict = Depends(_vendor),
):
    _db_guard()
    db = get_db()
    filt: dict = {"vendor": to_oid(user["_id"])}
    if search: filt["name"] = {"$regex": search, "$options": "i"}
    if status: filt["approvalStatus"] = status

    skip = (page - 1) * limit
    cursor = db.products.find(filt).sort("createdAt", -1).skip(skip).limit(limit)
    products = serialize_list(await cursor.to_list(length=limit))
    total = await db.products.count_documents(filt)
    return {"success": True, "data": products, "total": total, "page": page}


@router.post("/products")
async def create_vendor_product(body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    db = get_db()
    now = datetime.utcnow()
    body["vendor"] = to_oid(user["_id"])
    body["approvalStatus"] = "draft" if body.get("status") == "draft" else "submitted"
    body.setdefault("createdAt", now)
    body["updatedAt"] = now

    result = await db.products.insert_one(body)
    inserted = await db.products.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted)}


@router.put("/products/{pid}")
async def update_vendor_product(pid: str, body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    db = get_db()
    existing = await db.products.find_one({"_id": to_oid(pid), "vendor": to_oid(user["_id"])})
    if not existing:
        raise HTTPException(404, "Product not found")

    if body.get("status") != "draft":
        body["approvalStatus"] = "submitted"
    body["updatedAt"] = datetime.utcnow()

    result = await db.products.find_one_and_update(
        {"_id": to_oid(pid)}, {"$set": body}, return_document=True)
    return {"success": True, "data": serialize_doc(result)}


@router.delete("/products/{pid}")
async def delete_vendor_product(pid: str, user: dict = Depends(_vendor)):
    _db_guard()
    await get_db().products.delete_one({"_id": to_oid(pid), "vendor": to_oid(user["_id"])})
    return {"success": True, "message": "Product deleted"}


# ── Order Management ─────────────────────────────────────────────────────────

@router.get("/orders")
async def list_vendor_orders(
    status: Optional[str] = None, page: int = 1, limit: int = 20, user: dict = Depends(_vendor),
):
    _db_guard()
    db = get_db()
    filt: dict = {}
    if status: filt["orderStatus"] = status

    skip = (page - 1) * limit
    cursor = db.orders.find(filt).sort("createdAt", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)
    total = await db.orders.count_documents(filt)
    data = [dict(serialize_doc(o), status=o.get("orderStatus")) for o in orders]
    return {"success": True, "data": data, "total": total, "page": page}


@router.put("/orders/{oid}/status")
async def update_vendor_order(oid: str, body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    update: dict = {"orderStatus": body.get("status")}
    if body.get("trackingNumber"):
        update["trackingId"] = body["trackingNumber"]
    await get_db().orders.update_one({"_id": to_oid(oid)}, {"$set": update})
    return {"success": True, "message": "Order updated"}


# ── Inventory ────────────────────────────────────────────────────────────────

@router.get("/inventory")
async def get_inventory(user: dict = Depends(_vendor)):
    _db_guard()
    cursor = get_db().products.find(
        {"vendor": to_oid(user["_id"])},
        {"name": 1, "sku": 1, "stock": 1, "inStock": 1, "image": 1},
    ).sort("stock", 1)
    products = serialize_list(await cursor.to_list(length=500))
    low_stock = [p for p in products if 0 < (p.get("stock") or 0) <= 10]
    out_of_stock = [p for p in products if not p.get("inStock") or (p.get("stock") or 0) == 0]
    return {"success": True, "data": {"products": products, "lowStock": low_stock, "outOfStock": out_of_stock}}


@router.put("/inventory/{pid}")
async def update_inventory(pid: str, body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    stock = int(body.get("stock", 0))
    result = await get_db().products.find_one_and_update(
        {"_id": to_oid(pid), "vendor": to_oid(user["_id"])},
        {"$set": {"stock": stock, "inStock": stock > 0}},
        return_document=True,
    )
    return {"success": True, "data": serialize_doc(result)}


# ── Coupons ──────────────────────────────────────────────────────────────────

@router.get("/coupons")
async def list_vendor_coupons(user: dict = Depends(_vendor)):
    _db_guard()
    cursor = get_db().coupons.find({"vendor": to_oid(user["_id"])}).sort("createdAt", -1)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=100))}


@router.post("/coupons")
async def create_vendor_coupon(body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    now = datetime.utcnow()
    body["vendor"] = to_oid(user["_id"])
    body.setdefault("createdAt", now)
    body["updatedAt"] = now
    result = await get_db().coupons.insert_one(body)
    inserted = await get_db().coupons.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted)}


@router.delete("/coupons/{cid}")
async def delete_vendor_coupon(cid: str, user: dict = Depends(_vendor)):
    _db_guard()
    await get_db().coupons.delete_one({"_id": to_oid(cid), "vendor": to_oid(user["_id"])})
    return {"success": True, "message": "Coupon deleted"}


# ── Banner Requests ──────────────────────────────────────────────────────────

@router.post("/banners")
async def request_banner(body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    now = datetime.utcnow()
    body.update({"vendor": to_oid(user["_id"]), "status": "pending", "type": "vendor",
                 "createdAt": now, "updatedAt": now})
    result = await get_db().banners.insert_one(body)
    inserted = await get_db().banners.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted)}


@router.get("/banners")
async def list_vendor_banners(user: dict = Depends(_vendor)):
    _db_guard()
    cursor = get_db().banners.find({"vendor": to_oid(user["_id"])}).sort("createdAt", -1)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=50))}


# ── Reviews ──────────────────────────────────────────────────────────────────

@router.get("/reviews")
async def list_vendor_reviews(user: dict = Depends(_vendor)):
    _db_guard()
    cursor = get_db().products.find(
        {"vendor": to_oid(user["_id"]), "reviews": {"$exists": True, "$not": {"$size": 0}}},
        {"name": 1, "reviews": 1, "rating": 1},
    )
    products = await cursor.to_list(length=100)
    reviews = []
    for p in products:
        for r in p.get("reviews", []):
            entry = serialize_doc(dict(r))
            entry["productName"] = p["name"]
            entry["productId"] = str(p["_id"])
            reviews.append(entry)
    return {"success": True, "data": reviews}


# ── Vendor Profile ───────────────────────────────────────────────────────────

@router.get("/profile")
async def get_vendor_profile(user: dict = Depends(_vendor)):
    _db_guard()
    doc = await get_db().users.find_one({"_id": to_oid(user["_id"])}, {"password_hash": 0})
    return {"success": True, "data": serialize_doc(doc)}


@router.put("/profile")
async def update_vendor_profile(body: dict, user: dict = Depends(_vendor)):
    _db_guard()
    allowed = {"name", "phone", "address", "vendorProfile"}
    update = {k: v for k, v in body.items() if k in allowed}
    update["updatedAt"] = datetime.utcnow()
    result = await get_db().users.find_one_and_update(
        {"_id": to_oid(user["_id"])}, {"$set": update},
        return_document=True, projection={"password_hash": 0},
    )
    return {"success": True, "data": serialize_doc(result)}


# ── Notifications ────────────────────────────────────────────────────────────

@router.get("/notifications")
async def vendor_notifications(user: dict = Depends(_vendor)):
    _db_guard()
    vid = to_oid(user["_id"])
    cursor = get_db().notifications.find({
        "$or": [{"targetUser": vid}, {"targetRole": "vendor"}, {"targetRole": "all"}],
    }).sort("createdAt", -1).limit(30)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=30))}


# ── Sales Report ─────────────────────────────────────────────────────────────

@router.get("/reports/sales")
async def vendor_sales_report(user: dict = Depends(_vendor)):
    _db_guard()
    pipeline = [
        {"$match": {"items.vendor": to_oid(user["_id"]), "paymentStatus": "paid"}},
        {"$group": {
            "_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}},
            "revenue": {"$sum": "$totalAmount"}, "orders": {"$sum": 1},
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    months = await get_db().orders.aggregate(pipeline).to_list(length=12)
    return {"success": True, "data": months}
