import os
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

_security = HTTPBearer(auto_error=False)


def _jwt_secret() -> str:
    return os.getenv("JWT_SECRET", "fallback_secret_for_dev")


def _decode(token: str) -> dict:
    payload = jwt.decode(token, _jwt_secret(), algorithms=["HS256"])
    return {"_id": str(payload.get("id")), "role": payload.get("role", "customer")}


async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authorised — no token provided")
    try:
        return _decode(credentials.credentials)
    except JWTError:
        raise HTTPException(status_code=401, detail="Not authorised — token is invalid or expired")


async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security),
) -> Optional[dict]:
    if not credentials:
        return None
    try:
        return _decode(credentials.credentials)
    except JWTError:
        return None


def require_role(*roles: str):
    def _check(user: dict = Depends(require_auth)) -> dict:
        if user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied — requires role: {' or '.join(roles)}",
            )
        return user
    return _check
