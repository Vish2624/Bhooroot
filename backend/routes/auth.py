import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from config.database import get_db, is_connected
from middleware.auth import require_auth
from utils.helpers import serialize_doc, to_oid

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_ACCOUNTS = [
    {"email": "admin@uhazvumart.com",  "password": "admin123",  "role": "admin",    "name": "Super Admin", "id": "demo_admin_id"},
    {"email": "vendor@uhazvumart.com", "password": "vendor123", "role": "vendor",   "name": "Demo Vendor", "id": "demo_vendor_id"},
    {"email": "demo@uhazvumart.com",   "password": "demo123",   "role": "customer", "name": "Demo User",   "id": "demo_user_id"},
]


def _create_token(user_id: str, role: str = "customer") -> str:
    secret = os.environ["JWT_SECRET"]
    payload = {"id": str(user_id), "role": role, "exp": datetime.utcnow() + timedelta(days=30)}
    return jwt.encode(payload, secret, algorithm="HS256")


class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class ChangePasswordBody(BaseModel):
    currentPassword: str
    newPassword: str


class UpdateProfileBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[dict] = None


# POST /api/auth/register
@router.post("/register")
async def register(body: RegisterBody):
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    if not is_connected():
        return {
            "success": True,
            "message": "Registration successful (Demo Mode)",
            "token": _create_token("demo_user_id", "customer"),
            "user": {"id": "demo_id", "name": body.name, "email": body.email, "phone": body.phone, "role": "customer"},
        }

    db = get_db()
    if await db.users.find_one({"email": body.email.lower()}):
        raise HTTPException(400, "Email already registered")

    now = datetime.utcnow()
    doc = {
        "name": body.name,
        "email": body.email.lower().strip(),
        "phone": body.phone,
        "password_hash": pwd_context.hash(body.password),
        "role": "customer",
        "address": {"street": "", "city": "", "state": "", "pincode": ""},
        "isVerified": False,
        "isSuspended": False,
        "wishlist": [],
        "vendorProfile": {
            "businessName": "", "ownerName": "", "gstNumber": "", "panNumber": "",
            "storeLogo": "", "storeBanner": "", "storeDescription": "",
            "pickupAddress": "", "returnAddress": "",
            "bankName": "", "bankAccount": "", "ifscCode": "",
            "gstCertificate": "", "panCopy": "", "cancelledCheque": "", "idProof": "",
        },
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.users.insert_one(doc)
    uid = str(result.inserted_id)

    return {
        "success": True,
        "message": "Registration successful",
        "token": _create_token(uid, "customer"),
        "user": {"id": uid, "name": body.name, "email": body.email, "phone": body.phone, "role": "customer"},
    }


# POST /api/auth/login
@router.post("/login")
async def login(body: LoginBody):
    email = body.email.lower().strip()
    password = body.password

    if not is_connected():
        # Demo mode: only predefined accounts work — reject unknown credentials
        demo = next((a for a in DEMO_ACCOUNTS if a["email"] == email and a["password"] == password), None)
        if not demo:
            raise HTTPException(401, "Invalid credentials")
        return {
            "success": True,
            "message": "Login successful (Demo Mode)",
            "token": _create_token(demo["id"], demo["role"]),
            "user": {"id": demo["id"], "name": demo["name"], "email": demo["email"], "phone": "", "role": demo["role"]},
        }

    db = get_db()
    user = await db.users.find_one({"email": email})
    if not user or not pwd_context.verify(password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid credentials")

    if user.get("isSuspended"):
        raise HTTPException(403, "Account suspended. Contact support.")

    uid = str(user["_id"])
    return {
        "success": True,
        "message": "Login successful",
        "token": _create_token(uid, user.get("role", "customer")),
        "user": {"id": uid, "name": user["name"], "email": user["email"], "phone": user.get("phone", ""), "role": user.get("role", "customer")},
    }


# GET /api/auth/me
@router.get("/me")
async def me(user: dict = Depends(require_auth)):
    if not is_connected():
        return {"success": True, "data": user}
    db = get_db()
    doc = await db.users.find_one({"_id": to_oid(user["_id"])}, {"password_hash": 0})
    return {"success": True, "data": serialize_doc(doc)}


# PATCH /api/auth/profile
@router.patch("/profile")
async def update_profile(body: UpdateProfileBody, user: dict = Depends(require_auth)):
    if not is_connected():
        return {"success": True, "message": "Profile updated (Demo Mode)"}

    db = get_db()
    update = {k: v for k, v in body.dict().items() if v is not None}
    update["updatedAt"] = datetime.utcnow()

    doc = await db.users.find_one_and_update(
        {"_id": to_oid(user["_id"])},
        {"$set": update},
        return_document=True,
        projection={"password_hash": 0},
    )
    return {"success": True, "data": serialize_doc(doc)}


# POST /api/auth/logout
@router.post("/logout")
async def logout(user: dict = Depends(require_auth)):
    return {"success": True, "message": "Logged out successfully"}


# POST /api/auth/change-password
@router.post("/change-password")
async def change_password(body: ChangePasswordBody, user: dict = Depends(require_auth)):
    if len(body.newPassword) < 8:
        raise HTTPException(400, "New password must be at least 8 characters")

    if not is_connected():
        return {"success": True, "message": "Password changed successfully (Demo Mode)"}

    db = get_db()
    doc = await db.users.find_one({"_id": to_oid(user["_id"])})
    if not doc or not pwd_context.verify(body.currentPassword, doc.get("password_hash", "")):
        raise HTTPException(401, "Current password is incorrect")

    await db.users.update_one(
        {"_id": to_oid(user["_id"])},
        {"$set": {"password_hash": pwd_context.hash(body.newPassword), "updatedAt": datetime.utcnow()}},
    )
    return {"success": True, "message": "Password changed successfully"}
