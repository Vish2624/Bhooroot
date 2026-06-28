from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import require_auth
from utils.helpers import serialize_doc, serialize_list, to_oid

router = APIRouter()


class AddressBody(BaseModel):
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    country: str = "India"
    pincode: str
    isdefault: bool = False


# GET /api/addresses
@router.get("/")
async def get_addresses(user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    addresses = await db.user_addresses.find({"user_id": user["_id"]}).sort("isdefault", -1).to_list(None)
    return {"success": True, "data": serialize_list(addresses)}


# POST /api/addresses
@router.post("/")
async def create_address(body: AddressBody, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]
    now = datetime.utcnow()

    # Only one default address per user
    if body.isdefault:
        await db.user_addresses.update_many({"user_id": uid}, {"$set": {"isdefault": False}})

    # If first address, auto-set as default
    count = await db.user_addresses.count_documents({"user_id": uid})
    is_default = body.isdefault or count == 0

    doc = {
        "user_id": uid,
        "address_line1": body.address_line1,
        "address_line2": body.address_line2 or "",
        "city": body.city,
        "state": body.state,
        "country": body.country,
        "pincode": body.pincode,
        "isdefault": is_default,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.user_addresses.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "message": "Address saved", "data": serialize_doc(doc)}


# PATCH /api/addresses/{id}
@router.patch("/{address_id}")
async def update_address(address_id: str, body: AddressBody, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]

    addr = await db.user_addresses.find_one({"_id": to_oid(address_id), "user_id": uid})
    if not addr:
        raise HTTPException(404, "Address not found")

    if body.isdefault:
        await db.user_addresses.update_many({"user_id": uid}, {"$set": {"isdefault": False}})

    update = {**body.dict(), "updatedAt": datetime.utcnow()}
    doc = await db.user_addresses.find_one_and_update(
        {"_id": to_oid(address_id)},
        {"$set": update},
        return_document=True,
    )
    return {"success": True, "data": serialize_doc(doc)}


# PATCH /api/addresses/{id}/set-default
@router.patch("/{address_id}/set-default")
async def set_default_address(address_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]

    addr = await db.user_addresses.find_one({"_id": to_oid(address_id), "user_id": uid})
    if not addr:
        raise HTTPException(404, "Address not found")

    await db.user_addresses.update_many({"user_id": uid}, {"$set": {"isdefault": False}})
    doc = await db.user_addresses.find_one_and_update(
        {"_id": to_oid(address_id)},
        {"$set": {"isdefault": True, "updatedAt": datetime.utcnow()}},
        return_document=True,
    )
    return {"success": True, "message": "Default address updated", "data": serialize_doc(doc)}


# DELETE /api/addresses/{id}
@router.delete("/{address_id}")
async def delete_address(address_id: str, user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    uid = user["_id"]

    addr = await db.user_addresses.find_one({"_id": to_oid(address_id), "user_id": uid})
    if not addr:
        raise HTTPException(404, "Address not found")

    await db.user_addresses.delete_one({"_id": to_oid(address_id)})

    # If deleted address was default, set another as default
    if addr.get("isdefault"):
        next_addr = await db.user_addresses.find_one({"user_id": uid})
        if next_addr:
            await db.user_addresses.update_one(
                {"_id": next_addr["_id"]}, {"$set": {"isdefault": True}}
            )

    return {"success": True, "message": "Address deleted"}
