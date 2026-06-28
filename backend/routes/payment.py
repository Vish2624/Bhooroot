import hashlib
import hmac
import os
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import get_db, is_connected
from middleware.auth import require_auth
from utils.helpers import serialize_doc, serialize_list

router = APIRouter()


def _has_razorpay() -> bool:
    key_id = os.getenv("RAZORPAY_KEY_ID", "")
    return bool(key_id and not key_id.startswith("rzp_test_XXXX"))


def _rzp_client():
    try:
        import razorpay
        return razorpay.Client(
            auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
        )
    except ImportError:
        raise HTTPException(500, "razorpay package not installed — run: pip install razorpay")


class CheckoutItem(BaseModel):
    price: float
    qty: Optional[int] = 1


class CheckoutBody(BaseModel):
    items: List[CheckoutItem] = []
    total: Optional[float] = None


class InitiateBody(BaseModel):
    amount: float
    currency: Optional[str] = "INR"
    orderId: Optional[str] = None


class VerifyBody(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    orderId: Optional[str] = None


# POST /api/payment  (frontend default checkout endpoint)
@router.post("/")
async def checkout(body: CheckoutBody):
    if not body.items:
        raise HTTPException(400, "No items in order")

    amount = body.total or sum(i.price * (i.qty or 1) for i in body.items)

    if _has_razorpay():
        rzp = _rzp_client()
        order = rzp.order.create({
            "amount": int(round(amount * 100)),
            "currency": "INR",
            "receipt": f"rcpt_{int(datetime.utcnow().timestamp())}",
            "notes": {"source": "Uhazvumart Agro Store"},
        })
        return {"success": True, "order": order, "keyId": os.getenv("RAZORPAY_KEY_ID")}

    return {
        "success": True,
        "demo": True,
        "orderId": "FB-DEMO-" + str(int(datetime.utcnow().timestamp()))[-8:],
        "amount": amount,
        "message": "Demo payment accepted",
    }


# POST /api/payment/initiate
@router.post("/initiate")
async def initiate_payment(body: InitiateBody, user: dict = Depends(require_auth)):
    if body.amount <= 0:
        raise HTTPException(400, "Invalid amount")

    now = datetime.utcnow()

    if not _has_razorpay():
        rzp_order_id = "DEMO-" + str(int(now.timestamp()))[-8:]

        # Persist pending payment record
        if is_connected():
            db = get_db()
            await db.payments.insert_one({
                "order_id": body.orderId or "",
                "user_id": user["_id"],
                "transaction_id": rzp_order_id,
                "payment_gateway": "razorpay_demo",
                "amount": body.amount,
                "payment_method": "demo",
                "payment_status": "pending",
                "failure_reason": None,
                "paid_at": None,
                "created_at": now,
            })

        return {
            "success": True,
            "demo": True,
            "razorpayOrderId": rzp_order_id,
            "amount": int(round(body.amount * 100)),
            "currency": body.currency or "INR",
            "keyId": None,
        }

    rzp = _rzp_client()
    order = rzp.order.create({
        "amount": int(round(body.amount * 100)),
        "currency": body.currency or "INR",
        "receipt": body.orderId or f"rcpt_{int(now.timestamp())}",
        "notes": {"source": "Uhazvumart Agro Store"},
    })

    # Persist pending payment record
    if is_connected():
        db = get_db()
        await db.payments.insert_one({
            "order_id": body.orderId or "",
            "user_id": user["_id"],
            "transaction_id": order["id"],
            "payment_gateway": "razorpay",
            "amount": body.amount,
            "payment_method": "razorpay",
            "payment_status": "pending",
            "failure_reason": None,
            "paid_at": None,
            "created_at": now,
        })

    return {
        "success": True,
        "razorpayOrderId": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "keyId": os.getenv("RAZORPAY_KEY_ID"),
    }


# POST /api/payment/verify
@router.post("/verify")
async def verify_payment(body: VerifyBody, user: dict = Depends(require_auth)):
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected = hmac.new(
        key_secret.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(400, "Payment verification failed — invalid signature")

    now = datetime.utcnow()

    # Update payment record to success
    if is_connected():
        db = get_db()
        await db.payments.update_one(
            {"transaction_id": body.razorpay_order_id},
            {"$set": {
                "payment_status": "success",
                "transaction_id": body.razorpay_payment_id,
                "paid_at": now,
            }},
        )

    return {
        "success": True,
        "message": "Payment verified successfully",
        "paymentId": body.razorpay_payment_id,
    }


# GET /api/payment/history  (user's own payment history)
@router.get("/history")
async def payment_history(user: dict = Depends(require_auth)):
    if not is_connected():
        raise HTTPException(503, "Database unavailable")

    db = get_db()
    records = await db.payments.find(
        {"user_id": user["_id"]}
    ).sort("created_at", -1).limit(50).to_list(None)

    return {"success": True, "data": serialize_list(records)}
