from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import optional_auth, require_auth
from utils.helpers import get_pagination_metadata, serialize_doc, serialize_list, to_oid

router = APIRouter()


class ProductBody(BaseModel):
    name: str
    category: str
    price: float
    brand: Optional[str] = ""
    oldPrice: Optional[float] = None
    unit: Optional[str] = "piece"
    description: Optional[str] = ""
    shortDescription: Optional[str] = ""
    tag: Optional[str] = "new"
    image: Optional[str] = ""
    gallery: Optional[list] = []
    inStock: Optional[bool] = True
    stock: Optional[int] = 0
    featured: Optional[bool] = False
    status: Optional[str] = "active"
    variants: Optional[list] = []
    tags: Optional[list] = []


class ReviewBody(BaseModel):
    rating: float
    comment: str
    name: Optional[str] = None


# GET /api/products
@router.get("/")
async def list_products(
    category: Optional[str] = None,
    q: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    featured: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10,
    page: int = 1,
):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    term = q or search
    query: dict = {"approvalStatus": "approved", "status": {"$ne": "inactive"}}

    if category:
        query["category"] = category
    if featured == "true":
        query["featured"] = True
    if status:
        query["status"] = status
    if minPrice is not None or maxPrice is not None:
        price_q: dict = {}
        if minPrice is not None:
            price_q["$gte"] = minPrice
        if maxPrice is not None:
            price_q["$lte"] = maxPrice
        query["price"] = price_q
    if term:
        query["$text"] = {"$search": term}

    sort_map = {
        "price-asc":  [("price", 1)],
        "price-desc": [("price", -1)],
        "rating":     [("rating", -1)],
        "name":       [("name", 1)],
    }
    sort_query = sort_map.get(sort, [("createdAt", -1)])

    try:
        total = await db.products.count_documents(query)
        meta = get_pagination_metadata(page, limit, total)
        cursor = db.products.find(query).sort(sort_query).skip(meta["skip"]).limit(meta["limit"])
        products = serialize_list(await cursor.to_list(length=meta["limit"]))
    except Exception:
        if term and "$text" in query:
            # No text index yet — fall back to regex search
            del query["$text"]
            query["$or"] = [
                {"name": {"$regex": term, "$options": "i"}},
                {"description": {"$regex": term, "$options": "i"}},
                {"brand": {"$regex": term, "$options": "i"}},
            ]
            total = await db.products.count_documents(query)
            meta = get_pagination_metadata(page, limit, total)
            cursor = db.products.find(query).sort(sort_query).skip(meta["skip"]).limit(meta["limit"])
            products = serialize_list(await cursor.to_list(length=meta["limit"]))
        else:
            raise HTTPException(500, "Query failed")

    return {
        "success": True,
        "data": products,
        "pagination": {k: v for k, v in meta.items() if k != "skip"},
    }


# GET /api/products/:id
@router.get("/{product_id}")
async def get_product(product_id: str):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    doc = await db.products.find_one({"_id": to_oid(product_id)})
    if not doc:
        raise HTTPException(404, "Product not found")
    return {"success": True, "data": serialize_doc(doc)}


# POST /api/products
@router.post("/")
async def create_product(body: ProductBody, user: Optional[dict] = Depends(optional_auth)):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    now = datetime.utcnow()
    doc = body.dict()
    doc["vendor"] = to_oid(user["_id"]) if user else None
    doc["approvalStatus"] = "draft"
    doc["rating"] = doc.get("rating", 4.5)
    doc["reviews"] = []
    doc["createdAt"] = now
    doc["updatedAt"] = now

    result = await db.products.insert_one(doc)
    inserted = await db.products.find_one({"_id": result.inserted_id})
    return JSONResponse(status_code=201, content={"success": True, "data": serialize_doc(inserted)})


# PUT /api/products/:id  — requires auth; only admin or the owning vendor
@router.put("/{product_id}")
async def update_product(product_id: str, body: dict, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    product = await db.products.find_one({"_id": to_oid(product_id)})
    if not product:
        raise HTTPException(404, "Product not found")

    if user.get("role") != "admin":
        product_vendor = str(product.get("vendor", ""))
        if product_vendor != str(user["_id"]):
            raise HTTPException(403, "Not authorized to update this product")

    # Strip protected fields from caller payload
    for field in ("_id", "vendor", "createdAt", "approvalStatus"):
        body.pop(field, None)
    body["updatedAt"] = datetime.utcnow()

    result = await db.products.find_one_and_update(
        {"_id": to_oid(product_id)},
        {"$set": body},
        return_document=True,
    )
    return {"success": True, "data": serialize_doc(result)}


# DELETE /api/products/:id  — requires auth; only admin or the owning vendor
@router.delete("/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    product = await db.products.find_one({"_id": to_oid(product_id)})
    if not product:
        raise HTTPException(404, "Product not found")

    if user.get("role") != "admin":
        product_vendor = str(product.get("vendor", ""))
        if product_vendor != str(user["_id"]):
            raise HTTPException(403, "Not authorized to delete this product")

    await db.products.delete_one({"_id": to_oid(product_id)})
    return {"success": True, "message": "Product deleted"}


# POST /api/products/:id/reviews
@router.post("/{product_id}/reviews")
async def add_review(product_id: str, body: ReviewBody, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database not connected")
    if not (1 <= body.rating <= 5):
        raise HTTPException(400, "Rating must be between 1 and 5")

    db = get_db()
    product = await db.products.find_one({"_id": to_oid(product_id)})
    if not product:
        raise HTTPException(404, "Product not found")

    # One review per user
    for r in product.get("reviews", []):
        if str(r.get("userId", "")) == str(user["_id"]):
            raise HTTPException(400, "You have already reviewed this product")

    review = {
        "userId": str(user["_id"]),
        "name": body.name or user.get("name", "Customer"),
        "rating": body.rating,
        "comment": body.comment,
        "createdAt": datetime.utcnow().isoformat(),
    }

    existing_ratings = [r.get("rating", 0) for r in product.get("reviews", [])]
    new_avg = round((sum(existing_ratings) + body.rating) / (len(existing_ratings) + 1), 1)

    await db.products.update_one(
        {"_id": to_oid(product_id)},
        {
            "$push": {"reviews": review},
            "$set": {"rating": new_avg, "updatedAt": datetime.utcnow()},
        },
    )
    return {"success": True, "message": "Review added", "data": review}
