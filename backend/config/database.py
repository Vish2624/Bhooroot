from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient

_client: Optional[AsyncIOMotorClient] = None
_db = None
_uri: str = ""
_db_name: str = "uhazvumart"


def is_connected() -> bool:
    return _db is not None


async def connect_db(uri: str, db_name: str = "uhazvumart") -> None:
    global _client, _db, _uri, _db_name
    _uri = uri
    _db_name = db_name
    _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    await _client.admin.command("ping")
    _db = _client[db_name]


async def try_reconnect() -> bool:
    global _client, _db
    if not _uri:
        return False
    try:
        new_client = AsyncIOMotorClient(_uri, serverSelectionTimeoutMS=5000)
        await new_client.admin.command("ping")
        if _client:
            _client.close()
        _client = new_client
        _db = _client[_db_name]
        return True
    except Exception:
        return False


async def create_indexes() -> None:
    """Create indexes for all collections. Safe to call multiple times."""
    if _db is None:
        return
    try:
        # ── users ──────────────────────────────────────────────────────────────
        await _db.users.create_index("email", unique=True, background=True)
        await _db.users.create_index("role", background=True)
        await _db.users.create_index("status", background=True)

        # ── user_addresses ─────────────────────────────────────────────────────
        await _db.user_addresses.create_index("user_id", background=True)
        await _db.user_addresses.create_index([("user_id", 1), ("isdefault", 1)], background=True)

        # ── user_otps ──────────────────────────────────────────────────────────
        await _db.user_otps.create_index("user_id", background=True)
        await _db.user_otps.create_index("expires_at", expireAfterSeconds=0, background=True)

        # ── tokens (refresh / password-reset tokens) ───────────────────────────
        await _db.tokens.create_index("user_id", background=True)
        await _db.tokens.create_index("hashed_token", unique=True, background=True)
        await _db.tokens.create_index("expiresat", expireAfterSeconds=0, background=True)

        # ── products ───────────────────────────────────────────────────────────
        await _db.products.create_index(
            [("name", "text"), ("description", "text"), ("category", "text"), ("brand", "text")],
            background=True,
        )
        await _db.products.create_index(
            [("category", 1), ("approvalStatus", 1), ("status", 1)], background=True
        )
        await _db.products.create_index("vendor", background=True)
        await _db.products.create_index("featured", background=True)
        await _db.products.create_index([("createdAt", -1)], background=True)
        await _db.products.create_index("sku", sparse=True, background=True)

        # ── categories ─────────────────────────────────────────────────────────
        await _db.categories.create_index("slug", unique=True, background=True)
        await _db.categories.create_index("parent_id", background=True)
        await _db.categories.create_index("status", background=True)

        # ── orders ─────────────────────────────────────────────────────────────
        await _db.orders.create_index([("user", 1), ("createdAt", -1)], background=True)
        await _db.orders.create_index("orderNumber", unique=True, background=True)
        await _db.orders.create_index("orderStatus", background=True)
        await _db.orders.create_index("items.product", background=True)
        await _db.orders.create_index("shipping_address", background=True)

        # ── order_items (separate collection, mirrors embedded items) ──────────
        await _db.order_items.create_index("order_id", background=True)
        await _db.order_items.create_index("product_id", background=True)
        await _db.order_items.create_index("status", background=True)

        # ── payments ───────────────────────────────────────────────────────────
        await _db.payments.create_index("order_id", background=True)
        await _db.payments.create_index("user_id", background=True)
        await _db.payments.create_index("payment_status", background=True)
        await _db.payments.create_index("transaction_id", sparse=True, background=True)

        # ── inventory ──────────────────────────────────────────────────────────
        await _db.inventory.create_index("product_id", unique=True, background=True)
        await _db.inventory.create_index("status", background=True)

        # ── cart ───────────────────────────────────────────────────────────────
        await _db.cart.create_index([("user_id", 1), ("product_id", 1)], unique=True, background=True)
        await _db.cart.create_index("status", background=True)

        # ── roles ──────────────────────────────────────────────────────────────
        await _db.roles.create_index("role_name", unique=True, background=True)

        # ── permissions ────────────────────────────────────────────────────────
        await _db.permissions.create_index("permission_name", unique=True, background=True)

        # ── user_roles ─────────────────────────────────────────────────────────
        await _db.user_roles.create_index([("user_id", 1), ("role_id", 1)], unique=True, background=True)

        # ── role_permissions ───────────────────────────────────────────────────
        await _db.role_permissions.create_index(
            [("role_id", 1), ("permission_id", 1)], unique=True, background=True
        )

        # ── coupons / banners / vendors ────────────────────────────────────────
        await _db.coupons.create_index("code", unique=True, background=True)
        await _db.banners.create_index([("type", 1), ("status", 1)], background=True)
        await _db.vendors.create_index("status", background=True)

        print("MongoDB indexes created/verified")
    except Exception as exc:
        print(f"Index creation warning: {exc}")


def get_db():
    return _db


async def close_db() -> None:
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None
