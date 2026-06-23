from typing import Optional

from fastapi import APIRouter

from config.database import get_db, is_connected
from utils.helpers import serialize_list

router = APIRouter()


# GET /api/vendors
@router.get("/")
async def list_vendors(
    category: Optional[str] = None,
    verified: Optional[str] = None,
    search: Optional[str] = None,
):
    if not is_connected():
        return {"success": False, "message": "Database not connected"}, 503

    db = get_db()
    query: dict = {}
    if category:
        query["category"] = category
    if verified is not None:
        query["verified"] = verified.lower() == "true"
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.vendors.find(query).sort("rating", -1)
    vendors = serialize_list(await cursor.to_list(length=100))
    return {"success": True, "vendors": vendors}
