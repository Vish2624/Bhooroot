import os
from datetime import datetime

from fastapi import APIRouter

from config.database import get_db, is_connected
from utils.helpers import serialize_doc

router = APIRouter()

_DEMO_WHATSAPP = os.getenv("WHATSAPP_NUMBER", "917418702397")


# GET /api/coupons/validate/:code
@router.get("/validate/{code}")
async def validate_coupon(code: str):
    code = code.upper().strip()
    if not code:
        return {"success": False, "message": "Coupon code is required"}, 400

    if not is_connected():
        return {
            "success": True,
            "valid": True,
            "whatsappNumber": _DEMO_WHATSAPP,
            "description": "Bulk order enquiry",
            "bulkMinQty": 10,
            "bulkMinAmount": 5000,
        }

    db = get_db()
    coupon = await db.coupons.find_one({"code": code, "status": "active"})

    if not coupon:
        return {"success": True, "valid": False, "message": "Invalid or inactive coupon code"}

    now = datetime.utcnow()
    if coupon.get("startDate") and now < coupon["startDate"]:
        return {"success": True, "valid": False, "message": "This coupon is not active yet"}
    if coupon.get("expiryDate") and now > coupon["expiryDate"]:
        return {"success": True, "valid": False, "message": "This coupon has expired"}
    if coupon.get("usageLimit") is not None and coupon.get("usedCount", 0) >= coupon["usageLimit"]:
        return {"success": True, "valid": False, "message": "This coupon has reached its usage limit"}

    return {
        "success": True,
        "valid": True,
        "whatsappNumber": coupon.get("whatsappNumber", _DEMO_WHATSAPP),
        "description": coupon.get("description", ""),
        "bulkMinQty": coupon.get("bulkMinQty", 10),
        "bulkMinAmount": coupon.get("bulkMinAmount", 5000),
    }
