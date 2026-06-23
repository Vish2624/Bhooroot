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
    """Attempt to reconnect to MongoDB. Returns True on success."""
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
    """Create indexes for common query patterns. Safe to call multiple times."""
    if _db is None:
        return
    try:
        await _db.users.create_index("email", unique=True, background=True)
        await _db.users.create_index("role", background=True)

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

        await _db.orders.create_index([("user", 1), ("createdAt", -1)], background=True)
        await _db.orders.create_index("orderNumber", unique=True, background=True)
        await _db.orders.create_index("orderStatus", background=True)
        await _db.orders.create_index("items.product", background=True)

        await _db.categories.create_index("slug", unique=True, background=True)
        await _db.coupons.create_index("code", unique=True, background=True)
        await _db.banners.create_index([("type", 1), ("status", 1)], background=True)

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
