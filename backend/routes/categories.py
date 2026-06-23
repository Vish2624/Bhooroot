from fastapi import APIRouter, HTTPException

from config.database import get_db, is_connected
from utils.helpers import serialize_doc, serialize_list

router = APIRouter()


# GET /api/categories
@router.get("/")
async def list_categories():
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    cursor = db.categories.find({"isActive": True}).sort([("displayOrder", 1), ("name", 1)])
    cats = serialize_list(await cursor.to_list(length=200))
    return {"success": True, "data": cats}


# GET /api/categories/:slug
@router.get("/{slug}")
async def get_category(slug: str):
    if not is_connected():
        raise HTTPException(503, "Database not connected")

    db = get_db()
    cat = await db.categories.find_one({"slug": slug, "isActive": True})
    if not cat:
        raise HTTPException(404, "Category not found")
    return {"success": True, "data": serialize_doc(cat)}
