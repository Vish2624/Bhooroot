from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import optional_auth
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

    total = await db.products.count_documents(query)
    meta = get_pagination_metadata(page, limit, total)

    cursor = db.products.find(query).sort(sort_query).skip(meta["skip"]).limit(meta["limit"])
    products = serialize_list(await cursor.to_list(length=meta["limit"]))

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


# PUT /api/products/:id
@router.put("/{product_id}")
async def update_product(product_id: str, body: dict):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    body["updatedAt"] = datetime.utcnow()
    result = await db.products.find_one_and_update(
        {"_id": to_oid(product_id)},
        {"$set": body},
        return_document=True,
    )
    if not result:
        raise HTTPException(404, "Product not found")
    return {"success": True, "data": serialize_doc(result)}


# DELETE /api/products/:id
@router.delete("/{product_id}")
async def delete_product(product_id: str):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    result = await db.products.find_one_and_delete({"_id": to_oid(product_id)})
    if not result:
        raise HTTPException(404, "Product not found")
    return {"success": True, "message": "Product deleted"}
