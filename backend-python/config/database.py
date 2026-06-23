from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

_client: Optional[AsyncIOMotorClient] = None
_db = None


def is_connected() -> bool:
    return _db is not None


async def connect_db(uri: str, db_name: str = "uhazvumart") -> None:
    global _client, _db
    _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    await _client.admin.command("ping")
    _db = _client[db_name]


def get_db():
    return _db


async def close_db() -> None:
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None
