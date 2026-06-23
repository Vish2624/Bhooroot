from datetime import datetime
from typing import Optional

from fastapi import APIRouter

from config.database import get_db, is_connected
from utils.helpers import serialize_doc, serialize_list

router = APIRouter()


# GET /api/banners?type=hero|promotional|sidebar|festival
@router.get("/banners")
async def get_banners(type: Optional[str] = None):
    if not is_connected():
        return {"success": True, "data": []}

    db = get_db()
    now = datetime.utcnow()
    filt: dict = {
        "status": {"$in": ["active", "approved"]},
        "$or": [
            {"endDate": None},
            {"endDate": {"$exists": False}},
            {"endDate": {"$gte": now}},
        ],
    }
    if type:
        filt["type"] = type

    cursor = db.banners.find(filt).sort([("displayOrder", 1), ("createdAt", -1)])
    banners = serialize_list(await cursor.to_list(length=50))
    return {"success": True, "data": banners}


# GET /api/cms/:key
@router.get("/cms/{key}")
async def get_cms_section(key: str):
    if not is_connected():
        return {"success": True, "data": None}

    db = get_db()
    section = await db.cmssections.find_one({"sectionKey": key, "isVisible": True}, {"lastEditedBy": 0})
    return {"success": True, "data": serialize_doc(section)}
