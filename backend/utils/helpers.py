from datetime import datetime, date
from math import ceil
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException


# ── Document serialization ────────────────────────────────────────────────────

def _val(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, dict):
        return serialize_doc(v)
    if isinstance(v, list):
        return [_val(i) for i in v]
    return v


def serialize_doc(doc: Optional[dict]) -> Optional[dict]:
    if doc is None:
        return None
    result = {k: _val(v) for k, v in doc.items()}
    if "_id" in result and "id" not in result:
        result["id"] = result["_id"]
    return result


def serialize_list(docs) -> list:
    return [serialize_doc(d) for d in docs]


# ── ObjectId helper ───────────────────────────────────────────────────────────

def to_oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(str(id_str))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")


# ── Pagination ────────────────────────────────────────────────────────────────

def get_pagination_metadata(page, limit, total: int) -> dict:
    page = max(1, int(page or 1))
    limit = min(max(1, int(limit or 10)), 100)
    pages = ceil(total / limit) if total > 0 else 0
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages,
        "skip": (page - 1) * limit,
        "hasNext": page < pages,
        "hasPrev": page > 1,
    }
