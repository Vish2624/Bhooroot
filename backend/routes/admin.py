import re
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext

from config.database import get_db, is_connected
from middleware.auth import require_role
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_admin = require_role("admin")


def _db_guard():
    if not is_connected():
        raise HTTPException(503, "Database not connected (Demo Mode)")


# ── Dashboard Stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(user: dict = Depends(_admin)):
    _db_guard()
    db = get_db()

    (total_customers, total_vendors, pending_vendors,
     total_products, pending_products, total_orders, open_tickets) = await _gather([
        db.users.count_documents({"role": "customer"}),
        db.users.count_documents({"role": "vendor"}),
        db.users.count_documents({"role": "vendor", "isVerified": False}),
        db.products.count_documents({}),
        db.products.count_documents({"approvalStatus": "submitted"}),
        db.orders.count_documents({}),
        db.supporttickets.count_documents({"status": "open"}),
    ])

    revenue_agg = await db.orders.aggregate([
        {"$match": {"paymentStatus": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$totalAmount"}}},
    ]).to_list(length=1)
    total_revenue = revenue_agg[0]["total"] if revenue_agg else 0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = await db.orders.count_documents({"createdAt": {"$gte": today_start}})

    return {"success": True, "data": {
        "totalCustomers": total_customers, "totalVendors": total_vendors,
        "pendingVendors": pending_vendors, "totalProducts": total_products,
        "pendingProducts": pending_products, "totalOrders": total_orders,
        "todayOrders": today_orders, "totalRevenue": total_revenue, "openTickets": open_tickets,
    }}


async def _gather(coros):
    import asyncio
    return await asyncio.gather(*coros)


# ── Vendor Management ────────────────────────────────────────────────────────

@router.get("/vendors")
async def list_vendors(
    status: Optional[str] = None, search: Optional[str] = None,
    page: int = 1, limit: int = 20, user: dict = Depends(_admin),
):
    _db_guard()
    db = get_db()
    filt: dict = {"role": "vendor"}
    if status == "pending":   filt["isVerified"] = False
    if status == "approved":  filt["isVerified"] = True
    if status == "suspended": filt["isSuspended"] = True
    if search:                filt["name"] = {"$regex": search, "$options": "i"}

    skip = (page - 1) * limit
    cursor = db.users.find(filt, {"password_hash": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    vendors = serialize_list(await cursor.to_list(length=limit))
    total = await db.users.count_documents(filt)
    return {"success": True, "data": vendors, "total": total, "page": page}


@router.post("/vendors")
async def create_vendor(body: dict, user: dict = Depends(_admin)):
    _db_guard()
    db = get_db()
    if await db.users.find_one({"email": body.get("email", "").lower()}):
        raise HTTPException(400, "Email already registered")

    now = datetime.utcnow()
    doc = {
        "name": body["name"], "email": body["email"].lower(), "phone": body.get("phone", ""),
        "password_hash": pwd_context.hash(body["password"]),
        "role": "vendor", "isVerified": True, "isSuspended": False, "wishlist": [],
        "vendorProfile": {"businessName": body.get("businessName", body["name"]), "gstNumber": body.get("gstNumber", "")},
        "createdAt": now, "updatedAt": now,
    }
    result = await db.users.insert_one(doc)
    return {"success": True, "message": "Vendor created",
            "data": {"id": str(result.inserted_id), "name": body["name"], "email": body["email"], "role": "vendor"}}


@router.put("/vendors/{vid}/approve")
async def approve_vendor(vid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().users.update_one({"_id": to_oid(vid)}, {"$set": {"isVerified": True, "isSuspended": False}})
    return {"success": True, "message": "Vendor approved"}


@router.put("/vendors/{vid}/suspend")
async def suspend_vendor(vid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().users.update_one({"_id": to_oid(vid)}, {"$set": {"isSuspended": True}})
    return {"success": True, "message": "Vendor suspended"}


@router.delete("/vendors/{vid}")
async def delete_vendor(vid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().users.delete_one({"_id": to_oid(vid)})
    return {"success": True, "message": "Vendor deleted"}


# ── Product Management ───────────────────────────────────────────────────────

@router.get("/products")
async def list_admin_products(
    search: Optional[str] = None, category: Optional[str] = None,
    status: Optional[str] = None, featured: Optional[str] = None,
    page: int = 1, limit: int = 50, user: dict = Depends(_admin),
):
    _db_guard()
    db = get_db()
    filt: dict = {}
    if search:
        filt["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"brand": {"$regex": search, "$options": "i"}}]
    if category:  filt["category"] = category
    if status:    filt["status"] = status
    if featured == "true": filt["featured"] = True

    skip = (page - 1) * limit
    cursor = db.products.find(filt).sort("createdAt", -1).skip(skip).limit(limit)
    products = serialize_list(await cursor.to_list(length=limit))
    total = await db.products.count_documents(filt)
    return {"success": True, "data": products, "total": total, "page": page}


@router.post("/products")
async def create_admin_product(body: dict, user: dict = Depends(_admin)):
    _db_guard()
    db = get_db()
    now = datetime.utcnow()
    body.update({"approvalStatus": "approved", "status": body.get("status", "active"),
                 "createdAt": now, "updatedAt": now})
    result = await db.products.insert_one(body)
    inserted = await db.products.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted), "message": "Product created"}


@router.put("/products/{pid}")
async def update_admin_product(pid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    body["updatedAt"] = datetime.utcnow()
    result = await get_db().products.find_one_and_update(
        {"_id": to_oid(pid)}, {"$set": body}, return_document=True)
    if not result:
        raise HTTPException(404, "Product not found")
    return {"success": True, "data": serialize_doc(result), "message": "Product updated"}


@router.delete("/products/{pid}")
async def delete_admin_product(pid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().products.delete_one({"_id": to_oid(pid)})
    return {"success": True, "message": "Product deleted"}


@router.get("/products/pending")
async def pending_products(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().products.find({"approvalStatus": {"$in": ["submitted", "under_review"]}}).sort("createdAt", -1)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=100))}


@router.put("/products/{pid}/approve")
async def approve_product(pid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().products.update_one({"_id": to_oid(pid)}, {"$set": {"approvalStatus": "approved", "inStock": True}})
    return {"success": True, "message": "Product approved"}


@router.put("/products/{pid}/reject")
async def reject_product(pid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().products.update_one(
        {"_id": to_oid(pid)},
        {"$set": {"approvalStatus": "rejected", "rejectionReason": body.get("reason", "")}},
    )
    return {"success": True, "message": "Product rejected"}


# ── Customer Management ──────────────────────────────────────────────────────

@router.get("/customers")
async def list_customers(
    search: Optional[str] = None, page: int = 1, limit: int = 20, user: dict = Depends(_admin),
):
    _db_guard()
    db = get_db()
    filt: dict = {"role": "customer"}
    if search:
        filt["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}]
    skip = (page - 1) * limit
    cursor = db.users.find(filt, {"password_hash": 0}).sort("createdAt", -1).skip(skip).limit(limit)
    customers = serialize_list(await cursor.to_list(length=limit))
    total = await db.users.count_documents(filt)
    return {"success": True, "data": customers, "total": total, "page": page}


@router.put("/customers/{cid}/block")
async def block_customer(cid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().users.update_one({"_id": to_oid(cid)}, {"$set": {"isSuspended": True}})
    return {"success": True, "message": "Customer blocked"}


# ── Order Management ─────────────────────────────────────────────────────────

@router.get("/orders")
async def list_admin_orders(
    status: Optional[str] = None, page: int = 1, limit: int = 20, user: dict = Depends(_admin),
):
    _db_guard()
    db = get_db()
    filt: dict = {}
    if status: filt["orderStatus"] = status
    skip = (page - 1) * limit
    cursor = db.orders.find(filt).sort("createdAt", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)
    total = await db.orders.count_documents(filt)
    data = []
    for o in orders:
        doc = serialize_doc(o)
        doc["status"] = doc.get("orderStatus")
        data.append(doc)
    return {"success": True, "data": data, "total": total, "page": page}


@router.put("/orders/{oid}/status")
async def update_order_status_admin(oid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().orders.update_one({"_id": to_oid(oid)}, {"$set": {"orderStatus": body.get("status")}})
    return {"success": True, "message": "Order status updated"}


# ── Banner Management ────────────────────────────────────────────────────────

@router.get("/banners")
async def list_banners(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().banners.find().sort([("displayOrder", 1), ("createdAt", -1)])
    return {"success": True, "data": serialize_list(await cursor.to_list(length=100))}


@router.post("/banners")
async def create_banner(body: dict, user: dict = Depends(_admin)):
    _db_guard()
    now = datetime.utcnow()
    body.update({"status": "active", "createdAt": now, "updatedAt": now})
    result = await get_db().banners.insert_one(body)
    inserted = await get_db().banners.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted)}


@router.put("/banners/{bid}")
async def update_banner(bid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    result = await get_db().banners.find_one_and_update(
        {"_id": to_oid(bid)}, {"$set": body}, return_document=True)
    if not result:
        raise HTTPException(404, "Banner not found")
    return {"success": True, "data": serialize_doc(result)}


@router.put("/banners/{bid}/approve")
async def approve_banner(bid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().banners.update_one({"_id": to_oid(bid)}, {"$set": {"status": "approved"}})
    return {"success": True, "message": "Banner approved"}


@router.delete("/banners/{bid}")
async def delete_banner(bid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().banners.delete_one({"_id": to_oid(bid)})
    return {"success": True, "message": "Banner deleted"}


# ── CMS Sections ─────────────────────────────────────────────────────────────

@router.get("/cms")
async def list_cms(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().cmssections.find().sort("displayOrder", 1)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=100))}


@router.put("/cms/{section_key}")
async def update_cms(section_key: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    body["lastEditedBy"] = to_oid(user["_id"])
    result = await get_db().cmssections.find_one_and_update(
        {"sectionKey": section_key}, {"$set": body},
        upsert=True, return_document=True,
    )
    return {"success": True, "data": serialize_doc(result)}


# ── Reviews ──────────────────────────────────────────────────────────────────

@router.get("/reviews")
async def list_reviews(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().products.find(
        {"reviews": {"$exists": True, "$not": {"$size": 0}}},
        {"name": 1, "reviews": 1, "rating": 1},
    ).limit(50)
    products = await cursor.to_list(length=50)
    all_reviews = []
    for p in products:
        for r in p.get("reviews", []):
            entry = serialize_doc(dict(r))
            entry["productName"] = p["name"]
            entry["productId"] = str(p["_id"])
            all_reviews.append(entry)
    return {"success": True, "data": all_reviews}


# ── Support Tickets ──────────────────────────────────────────────────────────

@router.get("/tickets")
async def list_tickets(
    status: Optional[str] = None, page: int = 1, limit: int = 20, user: dict = Depends(_admin),
):
    _db_guard()
    db = get_db()
    filt: dict = {}
    if status: filt["status"] = status
    skip = (page - 1) * limit
    cursor = db.supporttickets.find(filt).sort("createdAt", -1).skip(skip).limit(limit)
    tickets = serialize_list(await cursor.to_list(length=limit))
    total = await db.supporttickets.count_documents(filt)
    return {"success": True, "data": tickets, "total": total}


@router.put("/tickets/{tid}/status")
async def update_ticket_status(tid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().supporttickets.update_one({"_id": to_oid(tid)}, {"$set": {"status": body.get("status")}})
    return {"success": True, "message": "Ticket updated"}


# ── Notifications ────────────────────────────────────────────────────────────

@router.post("/notifications")
async def send_notification(body: dict, user: dict = Depends(_admin)):
    _db_guard()
    now = datetime.utcnow()
    body.update({"sentBy": to_oid(user["_id"]), "createdAt": now, "updatedAt": now})
    result = await get_db().notifications.insert_one(body)
    inserted = await get_db().notifications.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted)}


@router.get("/notifications")
async def list_notifications(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().notifications.find().sort("createdAt", -1).limit(50)
    return {"success": True, "data": serialize_list(await cursor.to_list(length=50))}


# ── Category Management ──────────────────────────────────────────────────────

@router.get("/categories")
async def list_admin_categories(user: dict = Depends(_admin)):
    _db_guard()
    cursor = get_db().categories.find().sort([("displayOrder", 1), ("name", 1)])
    return {"success": True, "data": serialize_list(await cursor.to_list(length=200))}


@router.post("/categories")
async def create_category(body: dict, user: dict = Depends(_admin)):
    _db_guard()
    name = body.get("name", "")
    slug = re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", name.lower()))
    now = datetime.utcnow()
    doc = {
        "name": name, "slug": slug, "description": body.get("description", ""),
        "icon": body.get("icon", "mdi:leaf"), "image": body.get("image", ""),
        "displayOrder": body.get("displayOrder", 0), "isActive": True,
        "createdAt": now, "updatedAt": now,
    }
    result = await get_db().categories.insert_one(doc)
    inserted = await get_db().categories.find_one({"_id": result.inserted_id})
    return {"success": True, "data": serialize_doc(inserted), "message": "Category created"}


@router.put("/categories/{cid}")
async def update_category(cid: str, body: dict, user: dict = Depends(_admin)):
    _db_guard()
    if body.get("name"):
        body["slug"] = re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", body["name"].lower()))
    body["updatedAt"] = datetime.utcnow()
    result = await get_db().categories.find_one_and_update(
        {"_id": to_oid(cid)}, {"$set": body}, return_document=True)
    if not result:
        raise HTTPException(404, "Category not found")
    return {"success": True, "data": serialize_doc(result), "message": "Category updated"}


@router.delete("/categories/{cid}")
async def delete_category(cid: str, user: dict = Depends(_admin)):
    _db_guard()
    await get_db().categories.delete_one({"_id": to_oid(cid)})
    return {"success": True, "message": "Category deleted"}


# ── Sales Analytics ──────────────────────────────────────────────────────────

@router.get("/analytics/sales")
async def sales_analytics(user: dict = Depends(_admin)):
    _db_guard()
    pipeline = [
        {"$match": {"paymentStatus": "paid"}},
        {"$group": {
            "_id": {"year": {"$year": "$createdAt"}, "month": {"$month": "$createdAt"}},
            "revenue": {"$sum": "$totalAmount"}, "orders": {"$sum": 1},
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12},
    ]
    months = await get_db().orders.aggregate(pipeline).to_list(length=12)
    return {"success": True, "data": months}
